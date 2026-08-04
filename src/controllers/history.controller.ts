import type { Request, Response } from "express";
import * as game_service from "../services/games/index.service.js";
import { HttpError, NOT_FOUND_HISTORY, UNAUTHORIZED } from "../lib/error.js";
import type { GameType } from "../generated/prisma/enums.js";
import { toKstDayIndex } from "../services/streak.service.js";


const DEFAULT_TAKE = 20;
const MAX_TAKE = 100;
const GAME_TYPES = ["CARD", "QUIZ", "CHAT"] as const;

// 최근 N일 롤링 윈도우. "최근 한달"은 30일로 본다.
const PERIOD_DAYS = { day: 1, week: 7, month: 30 } as const;
type Period = keyof typeof PERIOD_DAYS;

const parsePeriod = (raw: unknown): Period =>
    typeof raw === "string" && raw in PERIOD_DAYS ? (raw as Period) : "day";

const periodRange = (period: Period) => {
    const to = new Date();
    const from = new Date(to.getTime() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000);
    return { from, to };
};

const parseTake = (raw: unknown) => {
    const n = typeof raw === "string" ? Number(raw) : Number.NaN;
    return Number.isInteger(n) && n > 0 ? Math.min(n, MAX_TAKE) : DEFAULT_TAKE;
};

const parseSkip = (raw: unknown) => {
    const n = typeof raw === "string" ? Number(raw) : Number.NaN;
    return Number.isInteger(n) && n > 0 ? n : 0;
};


/**
 * 기간별 학습량 요약 (양만) - GET /api/histories/summary?period=day|week|month
 */
export const getPeriodSummary = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const period = parsePeriod(req.query["period"]);
    const { from, to } = periodRange(period);

    const [grouped, dates] = await Promise.all([
        game_service.countGameHistoriesInPeriodByType(userId, from),
        game_service.getStudyDatesInPeriod(userId, from),
    ]);

    const byType: Record<string, number> = { CARD: 0, QUIZ: 0, CHAT: 0 };
    for (const row of grouped) byType[row.type] = row._count._all;

    const studyDays = new Set(dates.map((d) => toKstDayIndex(d.createdAt))).size;

    res.status(200).json({
        period,
        days: PERIOD_DAYS[period],
        from: from.toISOString(),
        to: to.toISOString(),
        total: dates.length,
        byType,
        studyDays,
    });
}


/**
 * 기간별 학습 내역 (디테일) - GET /api/histories/detail?period=day|week|month
 */
export const getPeriodDetail = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const period = parsePeriod(req.query["period"]);
    const { from, to } = periodRange(period);
    const take = parseTake(req.query["take"]);
    const skip = parseSkip(req.query["skip"]);

    const [histories, dates] = await Promise.all([
        game_service.getGameHistoriesInPeriod(userId, from, { take, skip }),
        game_service.getStudyDatesInPeriod(userId, from),
    ]);

    res.status(200).json({
        period,
        days: PERIOD_DAYS[period],
        from: from.toISOString(),
        to: to.toISOString(),
        total: dates.length,
        take,
        skip,
        histories: histories.map((history) => ({
            id: history.id,
            type: history.type,
            question: history.question,
            result: history.result,
            createdAt: history.createdAt.toISOString(),
            updatedAt: history.updatedAt.toISOString(),
        })),
    });
}


/**
 * 내 학습 기록 목록 - type으로 게임 종류를 걸러낼 수 있다.
 */
export const getHistories = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const rawType = req.query["type"];
    const type = typeof rawType === "string" && (GAME_TYPES as readonly string[]).includes(rawType)
        ? (rawType as GameType)
        : undefined;

    const take = parseTake(req.query["take"]);
    const skip = parseSkip(req.query["skip"]);

    const [histories, total] = await Promise.all([
        game_service.getGameHistoriesByUserId(userId, { type, take, skip }),
        game_service.countGameHistoriesByUserId(userId, type),
    ]);

    res.status(200).json({
        total,
        take,
        skip,
        histories: histories.map((history) => ({
            id: history.id,
            type: history.type,
            createdAt: history.createdAt.toISOString(),
            updatedAt: history.updatedAt.toISOString(),
        })),
    });
}


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
