# syntax=docker/dockerfile:1

# ---------------- builder ----------------
FROM node:24-alpine AS builder
WORKDIR /app

RUN corepack enable

# 의존성 레이어를 먼저 캐싱한다. 소스가 바뀌어도 install은 재실행되지 않는다.
# postinstall(prisma generate)은 아직 schema가 없으므로 여기서는 건너뛴다.
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --ignore-scripts

COPY tsconfig.json prisma.config.ts ./
COPY prisma ./prisma
COPY src ./src

# prisma generate 결과는 src/generated 에 떨어지고, tsc가 dist로 함께 컴파일한다.
RUN pnpm exec prisma generate
RUN pnpm exec tsc


# ---------------- runner ----------------
FROM node:24-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV PNPM_HOME=/pnpm
ENV PATH=$PNPM_HOME:$PATH
RUN corepack enable

# 운영 의존성만 설치한다.
#  --ignore-scripts : prisma CLI가 devDependency라 postinstall(prisma generate)이 실패한다
#  --node-linker=hoisted : node_modules를 store 하드링크가 아닌 실제 파일로 풀어
#                          설치 후 store를 통째로 지울 수 있다 (이미지 크기 절반)
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN pnpm install --frozen-lockfile --prod --ignore-scripts --node-linker=hoisted \
    && rm -rf /pnpm/store /root/.cache

# chown -R 은 /app 전체를 새 레이어에 복제해 이미지가 두 배가 된다. COPY --chown 을 쓴다.
COPY --from=builder --chown=node:node /app/dist ./dist

USER node

EXPOSE 4000

# .env는 이미지에 넣지 않는다. 환경변수는 컨테이너 실행 시 주입한다.
CMD ["node", "--env-file-if-exists=.env", "dist/server.js"]
