import type { Request, Response } from "express";
import * as league_service from "../services/league.service.js";
import { UNAUTHORIZED } from "../lib/error.js";


const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;


/**
 * 상위 N명 랭킹 조회 (기본 10명) - 레벨과 경험치를 함께 내려준다.
 */
export const getTopRanking = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const raw = req.query["limit"];
    const parsed = typeof raw === "string" ? Number(raw) : Number.NaN;
    const limit = Number.isInteger(parsed) && parsed > 0 ? Math.min(parsed, MAX_LIMIT) : DEFAULT_LIMIT;

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
