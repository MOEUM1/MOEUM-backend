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


export const updateUserContext = async (userId:string, context:object) => {
    return await prisma.userContext.update({
        where: { userId },
        data: {
            context
        }
    })
}