import { prisma } from "../lib/prisma.js";


/**
 * 상위 랭킹 조회 - 누적 경험치(totalExp) 내림차순.
 *
 * totalExp는 levelToTotalExp(level, exp)로 유지되므로 레벨 -> 경험치 순 정렬과 결과가 같다.
 * 동점이면 먼저 생성된 캐릭터가 상위로 온다.
 */
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
                    user: {
                        select: { id: true, nickname: true },
                    },
                },
            },
        },
    })
}


/**
 * 전체 랭킹 대상 수 (캐릭터를 가진 유저 수)
 */
export const countRankedCharacters = async () => {
    return await prisma.characterLevel.count()
}


/**
 * 내 순위 - 랭킹 목록과 같은 기준으로 "나보다 앞선 사람" 수 + 1
 *
 * getTopCharacterLevels 는 totalExp desc -> createdAt asc 로 정렬한다.
 * totalExp 만 비교하면 동점자가 전부 같은 순위로 나와서, 목록에서는 3위인 사람이
 * /leagues/me 에서는 1위로 보이는 불일치가 생긴다. 동점 시 createdAt 까지 함께 비교한다.
 */
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
