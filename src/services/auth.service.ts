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

export const createUser = async (email:string, passwordHash:string, nickname:string, category:string) => {
    return await prisma.$transaction(async (tx)=>{
        const user = await tx.user.create({
            data: {
                email,
                passwordHash,
                nickname,
                category: [category],
            }
        })

        await tx.userContext.create({
            data: {
                userId: user.id,
            }
        })

        await tx.userStreak.create({
            data: {
                userId: user.id,
            }
        })

        return user;
    }) 
}

export const findUserById = async (userId:string) => {
    return await prisma.user.findUnique({
        where: { id: userId },
    })
}

export const deleteUserById = async (userId:string) => {
    return await prisma.user.delete({
        where: { id: userId },
    })
}