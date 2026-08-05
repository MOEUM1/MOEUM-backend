import type { NextFunction, Request, Response } from "express";
import { redis } from "../lib/redis.js";


type AnalysisRecord = { count: number; lastAnalysisTime: string };


/**
 * 분석 실행 여부를 res.locals.goAnalysis 에 담는다.
 * 조건: 마지막 분석 이후 overCount 판 이상 진행했거나, expireSeconds 가 지나 키가 만료된 경우.
 *
 * Redis 가 죽어 있어도 게임 제출이 막히면 안 되므로, 실패하면 분석만 건너뛰고 진행한다.
 */
export const keepAnalysis = (
    name: string,
    expireSeconds: number = 24 * 60 * 60,
    overCount: number = 4,
) => async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.user?.id;
    if (!userId) return next();

    const key = `analysis:${userId}:${name}`;

    const startNewWindow = async () => {
        res.locals["goAnalysis"] = true;
        const payload: AnalysisRecord = { count: 0, lastAnalysisTime: new Date().toISOString() };
        await redis.set(key, JSON.stringify(payload), { expiration: { type: "EX", value: expireSeconds } });
    };

    try {
        const raw = await redis.get(key);

        // 키가 없다 = 첫 게임이거나 expireSeconds 가 지나 만료됨
        if (!raw) {
            await startNewWindow();
            return next();
        }

        const record = JSON.parse(raw) as Partial<AnalysisRecord>;
        const played = (typeof record.count === "number" ? record.count : 0) + 1;

        if (played >= overCount) {
            await startNewWindow();
        } else {
            res.locals["goAnalysis"] = false;
            const payload: AnalysisRecord = {
                count: played,
                lastAnalysisTime: record.lastAnalysisTime ?? new Date().toISOString(),
            };
            // TTL 을 새로 주면 만료 조건이 계속 밀려 영원히 만료되지 않는다.
            await redis.set(key, JSON.stringify(payload), { expiration: "KEEPTTL" });
        }

        return next();
    } catch (error) {
        console.error(`[keepAnalysis] redis 실패, 분석 조건 판단을 건너뜁니다 userId=${userId}`, error);
        res.locals["goAnalysis"] = false;
        return next();
    }
};
