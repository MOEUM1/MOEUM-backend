import { prisma } from "../lib/prisma.js";


export const isUser = async (userId:string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
    })
}

export const findUserByEmail = async (email:string) => {
    return await prisma.user.findUnique({
        where: { email },
    })
}

export const createUser = async (email:string, passwordHashed:string, nickname:string) => {
    return await prisma.user.create({
        data: {
            email,
            passwordHashed,
            nickname
        }
    })
}