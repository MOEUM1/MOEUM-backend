import { prisma } from "../lib/prisma.js";



export const getCharacterByUserId = async (userId: string) => {
    return await prisma.character.findUnique({
        where: { userId },
    })
}

export const getCharacterLevelByCharacterId = async (characterId: string) => {
    return await prisma.characterLevel.findUnique({
        where: { characterId },
    })
}

export const updateCharacter = async (userId: string, data: { name?: string; description?: string }) => {
    return await prisma.character.update({
        where: { userId },
        data,
        include: {
            characterLevel: true,
        }
    })
}

export const createCharacter = async (userId: string, name: string) => {
    return await prisma.character.create({
        data: {
            userId,
            name,
            description: "",
            characterLevel: {
                create: {
                    level: 1,
                    exp: 0,
                }
            }
        },
        include: {
            characterLevel: true,
        }
    })
}

