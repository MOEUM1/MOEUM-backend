import type { Request, Response } from "express";
import * as auth_service from "../services/auth.service.js";
import * as char_service from "../services/character.service.js";
import { signAccessToken } from "../lib/jwt.js";
import type { DeleteAccountInput, SignupInput } from "../types/schema.js";
import { CONFLICT, INVALID_CREDENTIALS, UNAUTHORIZED } from "../lib/error.js";
import bcrypt from "bcryptjs";


export const signUp = async (req: Request, res: Response) => {
    const { email, password, nickname, category, choosed } = req.body as SignupInput;
    
    if (await auth_service.findUserByEmail(email)) {
        throw new CONFLICT("이미 존재하는 이메일입니다.");
    }

    const HashedPassword = await bcrypt.hash(password, 10);
    const user = await auth_service.createUser(email, HashedPassword, nickname, category);
    const character = await char_service.createCharacter(user.id, choosed);

    const accessToken = signAccessToken({
        id: user.id,
        email: user.email,
    });

    if (!character || !character.characterLevel) throw new Error("캐릭터 생성에 실패했습니다.");

    res.status(201).json({ 
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            createdAt: user.createdAt.toISOString(),
        },
        character: {
            id: character.id,
            level: character.characterLevel.level,
            exp: character.characterLevel.exp,
        },
        accessToken
     });
}

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body as SignupInput;

    const user = await auth_service.findUserByEmail(email)

    if (!user) throw new INVALID_CREDENTIALS("로그인 실패");

    const character = await char_service.getCharacterByUserId(user.id);

    if (!(await bcrypt.compare(password, user.passwordHash))) throw new INVALID_CREDENTIALS("로그인 실패");
    if (!character) throw new Error("캐릭터 조회에 실패했습니다.");
    const characterLevel = await char_service.getCharacterLevelByCharacterId(character.id);
    if (!characterLevel) throw new Error("캐릭터 조회에 실패했습니다.");

    const accessToken = signAccessToken({
        id: user.id,
        email: user.email,
    });

    res.status(200).json({ 
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            createdAt: user.createdAt.toISOString(),
        },
        character: {
            id: character.id,
            level: characterLevel.level,
            exp: characterLevel.exp,
        },
        accessToken
     });
    

}


export const getMyInfo = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new INVALID_CREDENTIALS("로그인 실패");

    const user = await auth_service.findUserById(userId);
    if (!user) throw new INVALID_CREDENTIALS("로그인 실패");

    res.status(200).json({
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            createdAt: user.createdAt.toISOString(),
        }
    });
}


export const deleteMyAccount = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const {password} = req.body as DeleteAccountInput;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const user = await auth_service.findUserById(userId);
    if (!user) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    if (!(await bcrypt.compare(password, user.passwordHash))) throw new INVALID_CREDENTIALS("비밀번호가 올바르지 않습니다.");

    await auth_service.deleteUserById(userId);

    res.status(204).send();
}

