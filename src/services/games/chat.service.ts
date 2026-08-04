import { env } from "../../config.js";
import { client } from "../../lib/openai.js";
import { createGameHistory } from "./index.service.js";


export const initExamGame = async (userId:string, subject:string) => {
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
        input: [
            {role: "developer", content: `너는 유저와 함께 ${subject}에 대해 배우고 있는 AI야`},
            {role: "developer", content: `너는 너가 배우고 있는것 관련해서 유저에게 간단하고 단순하지만 핵심을 찌르는 질문을 통해 지식을 확장 시킨다고 생각하면 돼`},
            {role: "developer", content: `너의 질문에 대해 사용자가 한 대답을 통해 너는 유저가 얼마나 이해했는지 판단하고, 그에 맞게 다음 질문을 내야해`},
            {role: "developer", content: `너는 유저가 이해하지 못한 부분에 대해 질문을 바꿔서 유저가 몰랐던 질문에 대한 대답을 다시 알아낼 수 있게 질문해야돼`},
            {role: "developer", content: `만약 유저가 이해하지 못한 부분에 대해 질문을 바꿔서 유저가 몰랐던 질문에 대한 대답을 알아냈다면, 기존의 문제가 된 질문과 같은걸 다시 질문하되, 교묘하게 바꿔놔줘`},
            {role: "developer", content: `여기서 유저가 적절한 대답을 내놓으면 이 질문의 주제에 대해선 사용자가 이해한걸로 판단하고 ${subject}의 다음 질문으로 넘어가`},
            {role: "developer", content: `만약 계속해서 답을 내놓지 못한 경우 적당히 하다가 이 유저는 이 주제에 대해 이걸 복습해야된다고 생각하고 ${subject}의 다음 질문으로 넘어가`},
            {role: "user", content: `좋아, 그럼 ${subject}에 대한 첫번째 질문 해줘`},
        ]
    })
    return {studyHistory, conversationId: cv.id, response}
}


export const sendAnswerToExamGame = async (conversationId:string, answer:string) => {
    const response = await client.responses.create({
        model: env.OPENAI_MODEL,
        input: [
            {role: "user", content: answer}
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
            {role: "developer", content: `모든 대화는 끝났어, 이제 대화를 바탕으로 이 유저에 대한 자세하게 내려줘`}
        ],
        conversation: conversationId
    })
    return response.output_text
}