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

