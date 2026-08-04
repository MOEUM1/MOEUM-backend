import type { Request, Response } from "express";
import * as league_service from "../services/league.service.js";
import { NOT_FOUND_CHARACTER, UNAUTHORIZED } from "../lib/error.js";
import type { LeagueTopQueryType } from "../types/schema.js";


export const getMyRank = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const [me, totalUsers] = await Promise.all([
        league_service.getMyRank(userId),
        league_service.countRankedCharacters(),
    ]);

    if (!me) throw new NOT_FOUND_CHARACTER();

    res.status(200).json({ totalUsers, ...me });
}


export const getTopRanking = async (_req: Request, res: Response) => {
    const { limit } = res.locals["query"] as LeagueTopQueryType;

    const [top, totalUsers] = await Promise.all([
        league_service.getTopCharacterLevels(limit),
        league_service.countRankedCharacters(),
    ]);

    res.status(200).json({
        totalUsers,
        rankings: top.map((characterLevel, i) => ({
            rank: i + 1,
            userId: characterLevel.character.user.id,
            nickname: characterLevel.character.user.nickname,
            characterName: characterLevel.character.name,
            level: characterLevel.level,
            exp: characterLevel.exp,
            totalExp: characterLevel.totalExp,
        })),
    });
}
