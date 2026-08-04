import { zodTextFormat } from "openai/helpers/zod.js";
import { env } from "../../config.js";
import { NOT_FOUND_HISTORY } from "../../lib/error.js";
import { client } from "../../lib/openai.js";
import { prisma } from "../../lib/prisma.js";
import { QuizGameQuestionSchema, QuizGameResultSchema, type QuizGameQuestionType, type QuizGameResultReqType, type QuizGameResultType } from "../../types/schema.js";
import { getGameHistoryById } from "./index.service.js";
import { withUserContext } from "../../lib/prompt.js";





export const createQuizGameHistory = async (userId:string) => {
    return await prisma.studyHistory.create({
        data: {
            userId,
            type: "QUIZ",
        }
    })
}




// TODO: 사용자 subject 기반으로 퀴즈 생성하기

export const generateQuizGameQuestions = async (subject:string, context:string) => {
    const conv = await client.conversations.create()
    const prompt = withUserContext(
        context,
        `내가 공부하는 분야는 ${subject}이야. 너는 형식에 맞게 문제 5개를 내야해, 뒤로 갈수록 점점 어려워지고 평균적으로 절반정도 맞을 정도의 난이도로 조절해줘`
    );
    const response = await client.responses.parse({
        model: env.OPENAI_MODEL,
        input: prompt,
        conversation: conv.id,
        text: {
            format: zodTextFormat(QuizGameQuestionSchema, "quiz_question")
        }
    })
    return {response: response.output_parsed as QuizGameQuestionType, conversationId: conv.id}
}


// AI로 채점 결과 돌리기기
export const gradeQuizGameResult = async (result: QuizGameResultReqType) => {
    const gameHistory = await getGameHistoryById(result.historyId);
    if (!gameHistory) throw new NOT_FOUND_HISTORY();
    const questions = gameHistory.question as QuizGameQuestionType

    const prompt = result.input.map((answer) => {
        return `index:${answer.index}  question: ${questions.find((q)=> q.index === answer.index)?.question}  -->  user's Answer: ${answer.answer}  \n`
    }).join("\n")

    return (await client.responses.parse({
        model: env.OPENAI_MODEL,
        input: prompt,   // TODO: 추후 퀴즈 질문들 생성 프롬프트도 함께 제공한다.
        conversation: gameHistory.aiconversations?.conversationId,
        text: {
            format: zodTextFormat(QuizGameResultSchema, "quiz_result")
        }
    })).output_parsed as QuizGameResultType
}

export const setQuizGameResult = async (studyHistoryId:string, result:QuizGameResultType) => {
    return await prisma.studyHistory.update({
        where: { id: studyHistoryId },
        data: {
            result: result,
        }
    })
}