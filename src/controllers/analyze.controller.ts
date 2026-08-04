import type { Request, Response } from "express";
import * as analyze_service from "../services/analyze.service.js";
import { trimContext, withUserContext, MAX_CONTEXT_CHARS } from "../lib/prompt.js";
import { NO_HISTORY, UNAUTHORIZED } from "../lib/error.js";


export const getMyAnalysis = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const userContext = await analyze_service.getUserContext(userId);

    res.status(200).json({
        analysis: userContext?.context ?? null,
        updatedAt: userContext?.updatedAt.toISOString() ?? null,
    });
}


export const requestAnalysis = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const analysis = await analyze_service.analyzeRecentGames(userId);
    if (analysis === null) throw new NO_HISTORY();

    res.status(200).json({ analysis });
}


export const getAnalysisSource = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

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


/**
 * 디버그용. 저장된 context 원문과, 게임 문제 생성 시 실제로 프롬프트에 실리는 형태를 함께 보여준다.
 * 클라이언트에서 쓰는 엔드포인트가 아니다.
 */
export const getMyContext = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const userContext = await analyze_service.getUserContext(userId);
    const raw = userContext?.context ?? "";
    const trimmed = trimContext(raw);

    res.status(200).json({
        exists: Boolean(userContext),
        rawLength: raw.length,
        trimmedLength: trimmed.length,
        maxChars: MAX_CONTEXT_CHARS,
        truncated: raw.trim().length > MAX_CONTEXT_CHARS,
        updatedAt: userContext?.updatedAt.toISOString() ?? null,
        raw,
        promptPreview: withUserContext(raw, "<여기에 실제 문제 생성 프롬프트가 들어감>"),
    });
}
