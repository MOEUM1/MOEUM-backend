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

export const createCharacter = async (userId: string, imageUrl: string) => {
    return await prisma.character.create({
        data: {
            userId,
            imageUrl,
            name: "",   //todo: 나중에 캐릭터 이름 설정 기능 추가
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

