import { env } from "../../config.js";
import { client } from "../../lib/openai.js";
import { prisma } from "../../lib/prisma.js";
import { createGameHistory } from "./index.service.js";
import { trimContext } from "../../lib/prompt.js";
import type { ChatGameResultType } from "../../types/schema.js";


export const initExamGame = async (userId:string, subject:string, context:string) => {
    const trimmedContext = trimContext(context);
    const studyHistory = await createGameHistory(userId, "CHAT")
    const cv = await client.conversations.create({
        metadata: {
            name: `Exam Game - ${subject}`,
            subject,
            studyHistoryId: studyHistory.id,
        }
    })

    const response = await client.responses.create({
        model: env.OPENAI_MODEL,
        // 첫 응답도 conversation에 붙여야 이후 턴에서 문맥이 이어진다.
        conversation: cv.id,
        input: [
            {role: "developer", content: `너는 ${subject}를 잘 모르는 사람이야. 유저가 선생이고 너는 유저한테 배우는 입장이야.`},
            {role: "developer", content: `너는 오직 질문만 한다. 유저 답변에 대한 평가·칭찬·정정·요약·설명을 절대 하지 마. "맞아요", "잘 설명했어요", "좋은 답변이에요" 같은 말도 하지 마. 답을 알려주지도 마.`},
            {role: "developer", content: `말투는 반말로 친구한테 묻듯이 편하게. 한 번에 질문은 하나만. 두세 문장을 넘기지 마. 마크다운 서식(**, ##, 목록)을 쓰지 마.`},
            {role: "developer", content: `일상에서 우연히 마주친 것처럼 물어봐. 전문용어를 모르면 모르는 대로 풀어서 묘사해도 돼.
예시:
"오늘 책에서 봤는데 4차방정식이 뭐야?"
"바이킹 같이 왔다갔다 하는거 이거 원리를 뭐라 하지?"`},
            {role: "developer", content: `유저 답변을 보고 이해도는 속으로만 판단해. 잘 아는 것 같으면 ${subject}의 다른 주제로 넘어가고, 잘 모르는 것 같으면 같은 개념을 다른 상황으로 바꿔서 다시 물어봐.`},
            {role: "developer", content: `계속 답을 못 하면 그 주제는 그냥 넘어가고 다른 걸 물어봐.`},
            ...(trimmedContext
                ? [{
                    role: "developer" as const,
                    content: `아래는 이 유저의 지금까지 학습 기록을 분석한 내용이야. 질문의 난이도와 주제를 여기에 맞춰서 조절하고, 이미 아는 부분보다 약한 부분을 파고들어.\n\n--- 사용자 학습 분석 ---\n${trimmedContext}\n--- 분석 끝 ---`,
                }]
                : []),
            {role: "user", content: `${subject} 관련해서 궁금한 거 하나 물어봐줘`},
        ]
    })
    return {studyHistory, conversationId: cv.id, response}
}


export const setChatGameResult = async (studyHistoryId:string, result:ChatGameResultType) => {
    return await prisma.studyHistory.update({
        where: { id: studyHistoryId },
        data: { result },
    })
}


export const sendAnswerToExamGame = async (conversationId:string, answer:string) => {
    const response = await client.responses.create({
        model: env.OPENAI_MODEL,
        input: [
            {role: "user", content: answer},
            // 턴이 쌓이면 평가하는 말투로 돌아가려 해서 매번 다시 못박는다.
            {role: "developer", content: `평가·칭찬·설명 없이 다음 질문 하나만 해. 반말로 짧게.`},
        ],
        conversation: conversationId
    })
    return response
}

export const resultAnswerToExamGame = async (conversationId:string, answer:string) => {
    const response = await client.responses.create({
        model: env.OPENAI_MODEL,
        input: [
            {role: "user", content: answer},
            {role: "developer", content: `대화는 여기서 끝이야. 지금부터는 질문하지 말고, 위 대화를 바탕으로 이 유저가 어떤 부분을 이해했고 어떤 부분이 부족한지 자세히 분석해서 정리해줘.`}
        ],
        conversation: conversationId
    })
    return response.output_text
}