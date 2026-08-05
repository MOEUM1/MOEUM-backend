import type { ResponseInput } from "openai/resources/responses/responses.js";
import { env } from "../config.js";
import type { StudyHistory } from "../generated/prisma/client.js";
import { client } from "../lib/openai.js";
import { prisma } from "../lib/prisma.js";


export const gameTypeToKor = {
    "CARD": "카드게임",
    "QUIZ": "퀴즈게임",
    "CHAT": "대화형 게임"
}

export const analyzeGames = async (studyHistorys: StudyHistory[], minLength:number) => {
    const games: ResponseInput = studyHistorys.map((history) => ({
        role: "user",
        content: `게임 타입: ${gameTypeToKor[history.type]},  질문: ${JSON.stringify(history.question)},  결과:${JSON.stringify(history.result)},  생성일: ${history.createdAt.toISOString()}`
    }))

    const length = minLength || studyHistorys.length * 200;

    const response = await client.responses.create({
        model: env.OPENAI_MODEL,
        input: [...games, 
            {role: "user", content: `위의 게임 기록들을 조사 분석해서 나에 대한 총평을 내려줘. 최소 ${length}자 이상으로.`},
        ]
    })

    return response.output_text
}


export const RECENT_GAME_COUNT = 5;


export const getRecentGameHistories = async (userId:string, take:number = RECENT_GAME_COUNT) => {
    return await prisma.studyHistory.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take,
    })
}


export const getUserContext = async (userId:string) => {
    return await prisma.userContext.findUnique({
        where: { userId }
    })
}


export const getUserContextText = async (userId:string) => {
    const userContext = await getUserContext(userId);
    return userContext?.context.trim() ?? "";
}


export const updateUserContext = async (userId:string, context:string) => {
    return await prisma.userContext.upsert({
        where: { userId },
        update: { context },
        create: { userId, context },
    })
}


export const analyzeRecentGames = async (userId:string, take:number = RECENT_GAME_COUNT) => {
    const histories = await getRecentGameHistories(userId, take);
    if (histories.length === 0) return null;

    const context = await analyzeGames(histories, 0);
    await updateUserContext(userId, context);
    return context;
}


/** catch 필수. reject가 새면 unhandledRejection으로 프로세스가 죽는다. */
export const runAnalyzeInBackground = (userId:string) => {
    void analyzeRecentGames(userId).catch((err) => {
        console.error(`[analyze] 백그라운드 분석 실패 userId=${userId}`, err);
    });
}