import { expToNextLevel, levelToTotalExp, TotalExpForLevel } from "../lib/level.js";
import { prisma } from "../lib/prisma.js";





export const getCharacterLevel = async (userId: string) => {
    return await prisma.character.findUnique({
        where: { userId },
        include: {
            characterLevel: true,
        }
    })
}

export const updateCharacterLevel = async (userId: string, level: number, exp: number) => {
    const character = await prisma.character.findUnique({
        where: { userId },
    })

    if (!character) throw new Error("캐릭터를 찾을 수 없습니다.");

    return await prisma.characterLevel.update({
        where: { characterId: character.id },
        data: {
            level,
            exp,
            totalExp: levelToTotalExp(level, exp),
        }
    })
}

export const updateCharacterTotalExp = async (userId: string, totalExp: number) => {
    const character = await prisma.character.findUnique({
        where: { userId },
    })

    if (!character) throw new Error("캐릭터를 찾을 수 없습니다.");

    const {level, exp} = TotalExpForLevel(totalExp)

    return await prisma.characterLevel.update({
        where: { characterId: character.id },
        data: {
            totalExp: totalExp,
            level: level,
            exp: exp,
        }
    })
}


export const getNeededExpForNextLevel = async (userId: string) => {
    const character = await prisma.character.findUnique({
        where: { userId },
        include: {
            characterLevel: true,
        }
    })

    if (!character || !character.characterLevel) throw new Error("캐릭터를 찾을 수 없습니다.");

    const currentLevel = character.characterLevel.level;
    return expToNextLevel(currentLevel);
}   





