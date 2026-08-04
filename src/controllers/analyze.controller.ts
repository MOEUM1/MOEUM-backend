import type { Request, Response } from "express";
import * as analyze_service from "../services/analyze.service.js";
import { HttpError, UNAUTHORIZED } from "../lib/error.js";


/**
 * 저장된 최신 AI 피드백 조회 - 게임 종료 시 백그라운드로 갱신된다.
 */
export const getMyAnalysis = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const userContext = await analyze_service.getUserContext(userId);

    res.status(200).json({
        analysis: userContext?.context ?? null,
        updatedAt: userContext?.updatedAt.toISOString() ?? null,
    });
}


/**
 * AI 피드백 즉시 재생성 - 게임 종료를 기다리지 않고 직접 요청할 때 사용한다.
 * OpenAI 호출이 끝날 때까지 응답이 지연된다.
 */
export const requestAnalysis = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const analysis = await analyze_service.analyzeRecentGames(userId);
    if (analysis === null) throw new HttpError(400, "NO_HISTORY", "분석할 학습 기록이 없습니다.");

    res.status(200).json({ analysis });
}


/**
 * 분석 대상이 되는 최근 게임 목록
 */
export const getAnalysisSource = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const histories = await analyze_service.getRecentGameHistories(userId);

    res.status(200).json({
        count: histories.length,
        histories: histories.map((history) => ({
            id: history.id,
            type: history.type,
            createdAt: history.createdAt.toISOString(),
        })),
    });
}
