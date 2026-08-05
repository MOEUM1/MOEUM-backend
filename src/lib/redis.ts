import { createClient } from "redis";
import { env } from "../config.js";


export const redis = createClient({
  url: env.REDIS_URL,
  socket: {
    reconnectStrategy: (retries) => (retries > 5 ? false : Math.min(retries * 200, 2000)),
  },
});

redis.on("error", (error) => {
  console.error("[redis]", error instanceof Error ? error.message : error);
});


/**
 * createClient 는 연결을 시작하지 않는다. connect() 없이 명령을 보내면 전부 ClientClosedError 로 실패한다.
 * Redis 가 없어도 API 는 떠야 하므로, 정해진 시간 안에 못 붙으면 포기하고 그냥 진행한다.
 */
export const connectRedis = async (timeoutMs = 3000) => {
  if (redis.isOpen) return;

  try {
    await Promise.race([
      redis.connect(),
      new Promise((_, reject) => setTimeout(() => reject(new Error(`연결 타임아웃 ${timeoutMs}ms`)), timeoutMs)),
    ]);
    console.log(`Redis connected: ${env.REDIS_URL}`);
  } catch (error) {
    console.error("[redis] 연결 실패, 분석 스로틀링 없이 동작합니다:", error instanceof Error ? error.message : error);
  }
};
