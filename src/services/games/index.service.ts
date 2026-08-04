import { prisma } from "../../lib/prisma.js";
import type { GameType } from "../../generated/prisma/enums.js";
import type { QuizGameQuestionType } from "../../types/schema.js";



export const getGameHistoryById = async (historyId:string) => {
    return await prisma.studyHistory.findUnique({
        where: { id: historyId },
        include: {
            aiconversations: true,
        }
    })
}


export const getGameHistoriesByUserId = async (
    userId:string,
    options: { type?: GameType; take: number; skip: number }
) => {
    return await prisma.studyHistory.findMany({
        where: { userId, ...(options.type ? { type: options.type } : {}) },
        orderBy: { createdAt: "desc" },
        take: options.take,
        skip: options.skip,
    })
}


export const countGameHistoriesByUserId = async (userId:string, type?:GameType) => {
    return await prisma.studyHistory.count({
        where: { userId, ...(type ? { type } : {}) },
    })
}


/** 기간 내 학습 기록 (디테일) */
export const getGameHistoriesInPeriod = async (
    userId:string,
    from:Date,
    options: { take: number; skip: number }
) => {
    return await prisma.studyHistory.findMany({
        where: { userId, createdAt: { gte: from } },
        orderBy: { createdAt: "desc" },
        take: options.take,
        skip: options.skip,
    })
}


/** 기간 내 게임 타입별 판수 (양) */
export const countGameHistoriesInPeriodByType = async (userId:string, from:Date) => {
    return await prisma.studyHistory.groupBy({
        by: ["type"],
        where: { userId, createdAt: { gte: from } },
        _count: { _all: true },
    })
}


/** from ~ to 구간의 학습 기록 */
export const getGameHistoriesInRange = async (
    userId:string,
    from:Date,
    to:Date,
    options: { type?: GameType; take: number; skip: number }
) => {
    return await prisma.studyHistory.findMany({
        where: {
            userId,
            createdAt: { gte: from, lte: to },
            ...(options.type ? { type: options.type } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: options.take,
        skip: options.skip,
    })
}


export const countGameHistoriesInRange = async (userId:string, from:Date, to:Date, type?:GameType) => {
    return await prisma.studyHistory.count({
        where: {
            userId,
            createdAt: { gte: from, lte: to },
            ...(type ? { type } : {}),
        },
    })
}


export const countGameHistoriesInRangeByType = async (userId:string, from:Date, to:Date) => {
    return await prisma.studyHistory.groupBy({
        by: ["type"],
        where: { userId, createdAt: { gte: from, lte: to } },
        _count: { _all: true },
    })
}


export const getStudyDatesInRange = async (userId:string, from:Date, to:Date, type?:GameType) => {
    return await prisma.studyHistory.findMany({
        where: {
            userId,
            createdAt: { gte: from, lte: to },
            ...(type ? { type } : {}),
        },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
    })
}


/** 대화 기록에 메시지를 이어붙인다. */
export const appendConversationMessages = async (
    studyHistoryId:string,
    messages: { role: "ai" | "user"; content: string }[]
) => {
    return await prisma.$transaction(async (tx) => {
        const conv = await tx.aIConversation.findUnique({ where: { StudyHistoryId: studyHistoryId } })
        if (!conv) return null;

        const prev = Array.isArray(conv.messages) ? conv.messages : [];
        return await tx.aIConversation.update({
            where: { StudyHistoryId: studyHistoryId },
            data: { messages: [...prev, ...messages] },
        })
    })
}


/** 기간 내 학습이 일어난 시각 목록 - 학습 일수 계산용 */
export const getStudyDatesInPeriod = async (userId:string, from:Date) => {
    return await prisma.studyHistory.findMany({
        where: { userId, createdAt: { gte: from } },
        select: { createdAt: true },
        orderBy: { createdAt: "asc" },
    })
}


export const createGameHistory = async (userId:string, type:GameType) => {
    return await prisma.studyHistory.create({
        data: {
            userId,
            type,
        }
    })
}

export const setQuestionWithConversation = async (studyHistoryId:string,conversationId:string, questions:QuizGameQuestionType) => {
    return await prisma.$transaction(async (tx) => {
        const studyHistory = await tx.studyHistory.update({
            where: { id: studyHistoryId },
            data: {
                question: questions,
            }
        })

        await tx.aIConversation.create({
            data: {
                StudyHistoryId: studyHistoryId,
                conversationId: conversationId,
            }
        })
        return studyHistory;

    })
    
}

