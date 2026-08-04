import type { Request, Response } from "express";
import * as auth_service from "../services/auth.service.js";
import * as user_service from "../services/user.service.js";
import * as streak_service from "../services/streak.service.js";
import { CONFLICT, NOT_FOUND_USER, UNAUTHORIZED } from "../lib/error.js";
import type { UpdateUserInput } from "../types/schema.js";


export const updateMyInfo = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { nickname, category, learningPrompt } = req.body as UpdateUserInput;

    if (nickname) {
        const owner = await user_service.findUserByNickname(nickname);
        if (owner && owner.id !== userId) throw new CONFLICT("이미 사용 중인 닉네임입니다");
    }

    const user = await user_service.updateUser(userId, { nickname, category, learningPrompt });

    res.status(200).json({
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            category: user.category,
            learningPrompt: user.learningPrompt,
            createdAt: user.createdAt.toISOString(),
            updatedAt: user.updatedAt.toISOString(),
        }
    });
}


export const getMyStreak = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const streak = await streak_service.getStreakByUserId(userId);

    res.status(200).json({
        count: streak?.count ?? 0,
        lastDate: streak?.lastDate?.toISOString() ?? null,
        studiedToday: streak_service.isStudiedToday(streak?.lastDate ?? null),
    });
}


export const getMyCategories = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const user = await auth_service.findUserById(userId);
    if (!user) throw new NOT_FOUND_USER();

    res.status(200).json({ category: user.category });
}
