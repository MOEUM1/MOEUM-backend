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
 * 내 순위 - 나보다 totalExp가 높은 사람 수 + 1
 */
export const getMyRank = async (userId: string) => {
    const character = await prisma.character.findUnique({
        where: { userId },
        include: { characterLevel: true },
    })

    if (!character || !character.characterLevel) return null;

    const higher = await prisma.characterLevel.count({
        where: { totalExp: { gt: character.characterLevel.totalExp } },
    })

    return {
        rank: higher + 1,
        characterName: character.name,
        level: character.characterLevel.level,
        exp: character.characterLevel.exp,
        totalExp: character.characterLevel.totalExp,
    }
}
