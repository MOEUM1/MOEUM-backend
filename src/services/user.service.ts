import { prisma } from "../lib/prisma.js";


export const findUserByNickname = async (nickname: string) => {
    return await prisma.user.findUnique({
        where: { nickname },
    })
}


export const updateUser = async (
    userId: string,
    data: { nickname?: string; category?: string[]; learningPrompt?: string }
) => {
    return await prisma.user.update({
        where: { id: userId },
        data,
    })
}
