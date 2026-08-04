import type { Request, Response } from "express";
import * as auth_service from "../services/auth.service.js";
import * as char_service from "../services/character.service.js";
import * as user_service from "../services/user.service.js";
import { signAccessToken } from "../lib/jwt.js";
import { CONFLICT, HttpError, INVALID_CREDENTIALS, NOT_FOUND_CHARACTER, NOT_FOUND_USER, UNAUTHORIZED } from "../lib/error.js";
import type { DeleteAccountInput, SigninInput, SignupInput } from "../types/schema.js";
import bcrypt from "bcryptjs";


const toUserResponse = (user: { id: string; email: string; nickname: string; createdAt: Date }) => ({
    id: user.id,
    email: user.email,
    nickname: user.nickname,
    createdAt: user.createdAt.toISOString(),
});


export const signUp = async (req: Request, res: Response) => {
    const { email, password, nickname, category, choosed } = req.body as SignupInput;

    if (await auth_service.findUserByEmail(email)) throw new CONFLICT("이미 존재하는 이메일입니다");
    if (await user_service.findUserByNickname(nickname)) throw new CONFLICT("이미 사용 중인 닉네임입니다");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await auth_service.createUser(email, passwordHash, nickname, category);
    const character = await char_service.createCharacter(user.id, choosed);

    if (!character || !character.characterLevel) {
        throw new HttpError(500, "CHARACTER_CREATE_FAILED", "캐릭터 생성에 실패했습니다");
    }

    res.status(201).json({
        user: toUserResponse(user),
        character: {
            id: character.id,
            name: character.name,
            level: character.characterLevel.level,
            exp: character.characterLevel.exp,
        },
        accessToken: signAccessToken({ id: user.id, email: user.email }),
    });
}


export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body as SigninInput;

    const user = await auth_service.findUserByEmail(email);
    if (!user) throw new INVALID_CREDENTIALS();
    if (!(await bcrypt.compare(password, user.passwordHash))) throw new INVALID_CREDENTIALS();

    const character = await char_service.getCharacterByUserId(user.id);
    if (!character) throw new NOT_FOUND_CHARACTER();

    const characterLevel = await char_service.getCharacterLevelByCharacterId(character.id);
    if (!characterLevel) throw new NOT_FOUND_CHARACTER();

    res.status(200).json({
        user: toUserResponse(user),
        character: {
            id: character.id,
            name: character.name,
            level: characterLevel.level,
            exp: characterLevel.exp,
        },
        accessToken: signAccessToken({ id: user.id, email: user.email }),
    });
}


export const getMyInfo = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const user = await auth_service.findUserById(userId);
    if (!user) throw new NOT_FOUND_USER();

    res.status(200).json({ user: toUserResponse(user) });
}


export const deleteMyAccount = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { password } = req.body as DeleteAccountInput;

    const user = await auth_service.findUserById(userId);
    if (!user) throw new NOT_FOUND_USER();
    if (!(await bcrypt.compare(password, user.passwordHash))) throw new INVALID_CREDENTIALS("비밀번호가 올바르지 않습니다");

    await auth_service.deleteUserById(userId);

    res.status(204).send();
}
