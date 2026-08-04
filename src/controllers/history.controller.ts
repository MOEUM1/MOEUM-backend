import type { Request, Response } from "express";
import * as game_service from "../services/games/index.service.js";
import { HttpError, NOT_FOUND_HISTORY, UNAUTHORIZED } from "../lib/error.js";


/**
 * 학습 기록 단건 조회 - 본인 기록만 조회할 수 있다.
 */
export const getHistory = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const historyId = req.params["historyId"];
    if (typeof historyId !== "string") throw new HttpError(400, "VALIDATION_ERROR", "historyId가 필요합니다.");

    const history = await game_service.getGameHistoryById(historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY("학습 기록을 찾을 수 없습니다.");

    res.status(200).json({
        history: {
            id: history.id,
            type: history.type,
            question: history.question,
            result: history.result,
            createdAt: history.createdAt.toISOString(),
            updatedAt: history.updatedAt.toISOString(),
        }
    });
}
