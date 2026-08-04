import type { Request, Response } from "express";
import * as game_service from "../services/games/index.service.js";
import { toKstDayIndex } from "../services/streak.service.js";
import { NOT_FOUND_HISTORY, UNAUTHORIZED } from "../lib/error.js";
import type {
    HistoryIdParamType,
    HistoryListQueryType,
    HistoryPeriodQueryType,
    HistoryRangeQueryType,
} from "../types/schema.js";


const PERIOD_DAYS = { day: 1, week: 7, month: 30 } as const;

const periodRange = (period: keyof typeof PERIOD_DAYS) => {
    const to = new Date();
    const from = new Date(to.getTime() - PERIOD_DAYS[period] * 24 * 60 * 60 * 1000);
    return { from, to };
};

const countStudyDays = (dates: { createdAt: Date }[]) =>
    new Set(dates.map((d) => toKstDayIndex(d.createdAt))).size;

const toByType = (grouped: { type: string; _count: { _all: number } }[]) => {
    const byType: Record<string, number> = { CARD: 0, QUIZ: 0, CHAT: 0 };
    for (const row of grouped) byType[row.type] = row._count._all;
    return byType;
};

const toSummary = (history: { id: string; type: string; createdAt: Date; updatedAt: Date }) => ({
    id: history.id,
    type: history.type,
    createdAt: history.createdAt.toISOString(),
    updatedAt: history.updatedAt.toISOString(),
});

const toDetail = (history: { id: string; type: string; question: unknown; result: unknown; createdAt: Date; updatedAt: Date }) => ({
    ...toSummary(history),
    question: history.question,
    result: history.result,
});


export const getHistories = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { type, take, skip } = res.locals["query"] as HistoryListQueryType;

    const [histories, total] = await Promise.all([
        game_service.getGameHistoriesByUserId(userId, { type, take, skip }),
        game_service.countGameHistoriesByUserId(userId, type),
    ]);

    res.status(200).json({ total, take, skip, histories: histories.map(toSummary) });
}


export const getPeriodSummary = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { period } = res.locals["query"] as HistoryPeriodQueryType;
    const { from, to } = periodRange(period);

    const [grouped, dates] = await Promise.all([
        game_service.countGameHistoriesInPeriodByType(userId, from),
        game_service.getStudyDatesInPeriod(userId, from),
    ]);

    res.status(200).json({
        period,
        days: PERIOD_DAYS[period],
        from: from.toISOString(),
        to: to.toISOString(),
        total: dates.length,
        byType: toByType(grouped),
        studyDays: countStudyDays(dates),
    });
}


export const getPeriodDetail = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { period, take, skip } = res.locals["query"] as HistoryPeriodQueryType;
    const { from, to } = periodRange(period);

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
        histories: histories.map(toDetail),
    });
}


/** GET /api/histories/range?from=&to=&type=&take=&skip= */
export const getRangeHistories = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { from, to, type, take, skip } = res.locals["query"] as HistoryRangeQueryType;

    const [histories, total, grouped, dates] = await Promise.all([
        game_service.getGameHistoriesInRange(userId, from, to, { type, take, skip }),
        game_service.countGameHistoriesInRange(userId, from, to, type),
        game_service.countGameHistoriesInRangeByType(userId, from, to),
        game_service.getStudyDatesInRange(userId, from, to, type),
    ]);

    res.status(200).json({
        from: from.toISOString(),
        to: to.toISOString(),
        type: type ?? null,
        total,
        take,
        skip,
        byType: toByType(grouped),
        studyDays: countStudyDays(dates),
        histories: histories.map(toDetail),
    });
}


export const getHistory = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { historyId } = res.locals["params"] as HistoryIdParamType;

    const history = await game_service.getGameHistoryById(historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY();

    res.status(200).json({ history: toDetail(history) });
}
