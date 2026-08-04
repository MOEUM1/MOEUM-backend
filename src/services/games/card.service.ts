import { env } from "../../config.js";
import { client } from "../../lib/openai.js";
import { prisma } from "../../lib/prisma.js";
import { zodTextFormat } from "openai/helpers/zod.js";
import { CardGameQuestionSchema, type CardGameQuestionType, type CardGameResultType } from "../../types/schema.js";
import { withUserContext } from "../../lib/prompt.js";






export const generateCardGameQuestions = async (subject:string, context:string) => {
    const response = await client.responses.parse({
        model: env.OPENAI_MODEL,
        input: withUserContext(
            context,
            `내가 공부하는 분야는 ${subject}이야. 너는 형식에 맞게 OX 문제 15개를 내야해, 뒤로 갈수록 점점 어려워지고 평균적으로 12문제정도 맞을 정도의 난이도로 조절해줘`
        ),
        text: {
            format: zodTextFormat(CardGameQuestionSchema, "card_question")
        }
    })
    return response.output_parsed as CardGameQuestionType
}

export const setCardGameQuestions = async (studyHistoryId:string, questions:CardGameQuestionType) => {
    return await prisma.studyHistory.update({
        where: { id: studyHistoryId },
        data: {
            question: questions,
        }
    })
}

export const setCardGameResult = async (studyHistoryId:string, result:CardGameResultType) => {
    return await prisma.studyHistory.update({
        where: { id: studyHistoryId },
        data: {
            result: result,
        }
    })
}