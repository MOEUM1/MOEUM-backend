import type { Request, Response } from "express";
import * as level_service from "../services/level.service.js";
import { HttpError, UNAUTHORIZED } from "../lib/error.js";


export const getMyCharacter = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const character = await level_service.getCharacterLevel(userId);
    if (!character || !character.characterLevel) throw new HttpError(404, "NOT_FOUND", "캐릭터를 찾을 수 없습니다.");

    const expToNextLevel = await level_service.getNeededExpForNextLevel(userId);

    res.status(200).json({
        character: {
            id: character.id,
            name: character.name,
            description: character.description,
            level: character.characterLevel.level,
            exp: character.characterLevel.exp,
            totalExp: character.characterLevel.totalExp,
            expToNextLevel,
            createdAt: character.createdAt.toISOString(),
        }
    });
}


export const getMyLevel = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const character = await level_service.getCharacterLevel(userId);
    if (!character || !character.characterLevel) throw new HttpError(404, "NOT_FOUND", "캐릭터를 찾을 수 없습니다.");

    const expToNextLevel = await level_service.getNeededExpForNextLevel(userId);

    res.status(200).json({
        level: character.characterLevel.level,
        exp: character.characterLevel.exp,
        totalExp: character.characterLevel.totalExp,
        expToNextLevel,
    });
}
