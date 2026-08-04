# 배포 가이드 (해커톤 VPS)

## 서버

| 항목 | 값 |
|---|---|
| IP | `165.140.22.54` |
| 계정 | `ubuntu` |
| 접속 | SSH Private Key 전용 (비밀번호 로그인 불가) |

`sudo` 비밀번호는 **이 저장소에 절대 기록하지 않습니다.** 팀 비밀번호 관리도구나 개인 메모로만 공유하세요.

```bash
chmod 600 ~/.ssh/moeum-hackathon.pem
```

```bash
ssh -i ~/.ssh/moeum-hackathon.pem ubuntu@165.140.22.54
```

---

## 1. 서버 최초 설정 (한 번만)

Docker 설치:

```bash
curl -fsSL https://get.docker.com | sudo sh
```

`ubuntu` 계정이 `sudo` 없이 docker를 쓰도록 등록합니다. 실행 후 **재접속해야** 적용됩니다.

```bash
sudo usermod -aG docker ubuntu
```

---

## 2. 코드 배치

```bash
git clone https://github.com/MOEUM1/MOEUM-backend.git ~/moeum && cd ~/moeum
```

---

## 3. 환경변수 작성

```bash
cp .env.example .env
```

`JWT_SECRET` 과 `POSTGRES_PASSWORD` 를 생성합니다:

```bash
echo "JWT_SECRET=$(openssl rand -base64 48)"
```

```bash
echo "POSTGRES_PASSWORD=$(openssl rand -base64 24)"
```

출력값을 `.env` 에 채우고, `DATABASE_URL` 의 비밀번호 자리도 `POSTGRES_PASSWORD` 와 동일하게 맞춘 뒤 `OPENAI_API_KEY` 를 넣습니다.

`.env` 는 `.gitignore` 와 `.dockerignore` 에 모두 들어 있어 커밋되지도, 이미지에 포함되지도 않습니다.

---

## 4. 실행

```bash
docker compose up -d --build
```

기동 순서는 compose가 보장합니다. `db` 가 healthy 가 되면 → `migrate` 가 `prisma migrate deploy` 를 돌리고 종료 → 그 다음 `app` 이 뜹니다.

확인:

```bash
curl -s http://localhost/api/health
```

외부에서:

```bash
curl -s http://165.140.22.54/api/health
```

---

## 5. 운영 명령

로그 보기:

```bash
docker compose logs -f app
```

새 커밋 반영:

```bash
git pull && docker compose up -d --build
```

마이그레이션만 다시 적용:

```bash
docker compose run --rm migrate
```

중지:

```bash
docker compose down
```

DB 볼륨까지 삭제 (데이터 전부 사라짐, 주의):

```bash
docker compose down -v
```

---

## 구조 메모

- **Dockerfile 은 2단계**입니다. `builder` 에서 `prisma generate` + `tsc` 를 돌리고, `runner` 에는 `dist/` 와 운영 의존성만 담습니다.
- `prisma` CLI 는 devDependency 라 운영 이미지에 없습니다. 그래서 마이그레이션은 `builder` 스테이지를 쓰는 별도 `migrate` 서비스가 담당합니다.
- 앱은 컨테이너 안에서 `node` 유저로 돕니다 (root 아님).
- postgres 는 호스트에 포트를 열지 않습니다. `app` 컨테이너만 내부 네트워크로 접근합니다.
- `.env` 는 이미지에 들어가지 않습니다. 환경변수는 compose 가 런타임에 주입합니다.

## 배포 전 점검

- [ ] `.env` 의 `JWT_SECRET` 이 개발용 값이 아닌 새로 생성한 값인가
- [ ] `POSTGRES_PASSWORD` 와 `DATABASE_URL` 의 비밀번호가 일치하는가
- [ ] `git status` 에 `.env` 가 올라와 있지 않은가
- [ ] 방화벽에서 80 포트가 열려 있는가
