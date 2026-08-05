import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config.js";
import { PrismaClient } from "../generated/prisma/client.js";


const globalForPrisma = global as unknown as { prisma: PrismaClient };

// Railway 는 앱이 외부에 있으면 공개 TCP 프록시(*.proxy.rlwy.net)를 거친다.
// 이 프록시가 유휴 커넥션을 끊어도 클라이언트 소켓은 ESTABLISHED 로 남아,
// 풀이 죽은 커넥션을 재사용하면서 모든 쿼리가 무한 대기에 빠진다.
// idleTimeoutMillis 로 프록시보다 먼저 정리하고, 타임아웃으로 최악의 경우를 끊는다.
export const prisma =
  globalForPrisma.prisma || new PrismaClient({
    adapter: new PrismaPg({
      connectionString: env.DATABASE_URL,
      keepAlive: true,
      keepAliveInitialDelayMillis: 10_000,
      idleTimeoutMillis: 30_000,
      connectionTimeoutMillis: 5_000,
      query_timeout: 20_000,
      statement_timeout: 20_000,
      max: 10,
    }),
  })

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
