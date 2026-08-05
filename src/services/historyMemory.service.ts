import type { GameType } from "../generated/prisma/enums.js";
import { redis } from "../lib/redis.js";
import { gameTypeToKor } from "./analyze.service.js";


export interface memHisType {
    type: GameType;
    question: string;
    result: string;
}


// Redis 는 캐시라서 실패해도 게임 진행을 막지 않는다.
export const memSaveGameHistory = async (userId:string, type:GameType, question:string, result:string) => {
    try {
        await redis.set(
            `gameHistory:${userId}:${(new Date()).toISOString()}`,
            JSON.stringify({ type, question, result }),
            { expiration: { type: "EX", value: 30 * 60 } },
        );
    } catch (error) {
        console.error(`[memHistory] 저장 실패 userId=${userId}`, error instanceof Error ? error.message : error);
    }
}


export const memGetGameHistories = async (userId:string, take:number) => {
    try {
        // 키 끝이 ISO 시각이라 사전순 정렬이 곧 시간순이다. 최신부터 본다.
        const keys = (await redis.keys(`gameHistory:${userId}:*`)).sort().reverse();

        const histories = await Promise.all(keys.map(async (key, index) => {
            if (index >= 6) await redis.expire(key, 1); // 6개 이상이면 만료시키기
            const value = await redis.get(key);
            return value ? JSON.parse(value) : null;
        }));

        return histories.filter((history) => history !== null).slice(0, take) as memHisType[];
    } catch (error) {
        console.error(`[memHistory] 조회 실패 userId=${userId}`, error instanceof Error ? error.message : error);
        return [];
    }
}


export const memHistoryToInput = (histories: memHisType[]) => {
    return histories.map((history) => ({
        role: "user",
        content: `게임 타입: ${gameTypeToKor[history.type]},  질문: ${history.question},  결과:${history.result}`
    }))
}
