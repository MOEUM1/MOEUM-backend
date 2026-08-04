import { prisma } from "../lib/prisma.js";


/** totalExp 내림차순, 동점이면 먼저 생성된 캐릭터가 상위. */
export const getTopCharacterLevels = async (limit: number) => {
    return await prisma.characterLevel.findMany({
        take: limit,
        orderBy: [
            { totalExp: "desc" },
            { createdAt: "asc" },
        ],
        include: {
            character: {
                include: {
                    user: { select: { id: true, nickname: true } },
                },
            },
        },
    })
}


export const countRankedCharacters = async () => {
    return await prisma.characterLevel.count()
}


/** 순위 기준은 getTopCharacterLevels 의 정렬과 동일해야 목록과 어긋나지 않는다. */
export const getMyRank = async (userId: string) => {
    const character = await prisma.character.findUnique({
        where: { userId },
        include: { characterLevel: true },
    })

    if (!character || !character.characterLevel) return null;

    const { totalExp, createdAt } = character.characterLevel;

    const higher = await prisma.characterLevel.count({
        where: {
            OR: [
                { totalExp: { gt: totalExp } },
                { totalExp, createdAt: { lt: createdAt } },
            ],
        },
    })

    return {
        rank: higher + 1,
        characterName: character.name,
        level: character.characterLevel.level,
        exp: character.characterLevel.exp,
        totalExp: character.characterLevel.totalExp,
    }
}
