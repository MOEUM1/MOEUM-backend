import type { ResponseInput } from "openai/resources/responses/responses.js";
import { env } from "../config.js";
import type { StudyHistory } from "../generated/prisma/client.js";
import { client } from "../lib/openai.js";
import { prisma } from "../lib/prisma.js";


const gameTypeToKor = {
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


// 게임 종료 후 분석에 사용할 최근 게임 수
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


/** 문제 생성 프롬프트에 넣을 학습 맥락. 아직 분석된 게 없으면 빈 문자열. */
export const getUserContextText = async (userId:string) => {
    const userContext = await getUserContext(userId);
    return userContext?.context.trim() ?? "";
}


// UserContext.context 는 String 컬럼이므로 문자열을 받는다.
// 백그라운드에서 돌기 때문에 행이 없으면 조용히 실패하지 않도록 upsert 한다.
export const updateUserContext = async (userId:string, context:string) => {
    return await prisma.userContext.upsert({
        where: { userId },
        update: { context },
        create: { userId, context },
    })
}


/**
 * 최근 N게임을 바탕으로 총평을 만들어 UserContext에 저장한다.
 * 기록이 없으면 아무것도 하지 않는다.
 */
export const analyzeRecentGames = async (userId:string, take:number = RECENT_GAME_COUNT) => {
    const histories = await getRecentGameHistories(userId, take);
    if (histories.length === 0) return null;

    const context = await analyzeGames(histories, 0);
    await updateUserContext(userId, context);
    return context;
}


/**
 * 게임 종료 시 호출. 응답을 막지 않도록 await 하지 않고 백그라운드로 돌린다.
 *
 * catch를 반드시 걸어야 한다. 여기서 reject가 새어나가면 Node가
 * unhandledRejection으로 프로세스를 종료시킨다.
 */
export const runAnalyzeInBackground = (userId:string) => {
    void analyzeRecentGames(userId).catch((err) => {
        console.error(`[analyze] 백그라운드 분석 실패 userId=${userId}`, err);
    });
}