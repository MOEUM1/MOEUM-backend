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


/**
 * 경험치를 더하고 레벨을 다시 계산한다.
 *
 * 조회 -> 계산 -> 저장이 트랜잭션 안에서 일어나야 동시에 두 게임이 끝났을 때
 * 한쪽 경험치가 덮어써져 사라지지 않는다.
 */
export const addExp = async (userId: string, amount: number) => {
    return await prisma.$transaction(async (tx) => {
        const character = await tx.character.findUnique({
            where: { userId },
            include: { characterLevel: true },
        })

        if (!character || !character.characterLevel) throw new Error("캐릭터를 찾을 수 없습니다.");

        const before = {
            level: character.characterLevel.level,
            exp: character.characterLevel.exp,
            totalExp: character.characterLevel.totalExp,
        }

        const totalExp = before.totalExp + amount;
        const { level, exp } = TotalExpForLevel(totalExp);

        await tx.characterLevel.update({
            where: { characterId: character.id },
            data: { level, exp, totalExp },
        })

        return {
            gainedExp: amount,
            leveledUp: level > before.level,
            before,
            after: { level, exp, totalExp },
            expToNextLevel: expToNextLevel(level),
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





