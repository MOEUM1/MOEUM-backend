import type { Request, Response } from "express";
import * as auth_service from "../services/auth.service.js";
import { signAccessToken } from "../lib/jwt.js";
import type { DeleteAccountInput, SignupInput } from "../types/schema.js";
import { CONFLICT, INVALID_CREDENTIALS } from "../lib/error.js";
import bcrypt from "bcryptjs";


export const signUp = async (req: Request, res: Response) => {
    const { email, password, nickname, category } = req.body as SignupInput;
    
    if (await auth_service.findUserByEmail(email)) {
        throw new CONFLICT("이미 존재하는 이메일입니다.");
    }

    const HashedPassword = await bcrypt.hash(password, 10);
    const user = await auth_service.createUser(email, HashedPassword, nickname, category);
    const accessToken = signAccessToken({
        id: user.id,
        email: user.email,
    });

    res.status(201).json({ 
        user: {
            id: user.id,
            email: user.email,
            nickname: user.nickname,
            createdAt: user.createdAt.toISOString(),
        },
        accessToken
     });
}

export const signIn = async (req: Request, res: Response) => {
    const { email, password } = req.body as SignupInput;

    const user = await auth_service.findUserByEmail(email)

    if (!user) throw new INVALID_CREDENTIALS("로그인 실패");

    if (!(await bcrypt.compare(password, user.passwordHash))) throw new INVALID_CREDENTIALS("로그인 실패");

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
    if (!userId) throw new INVALID_CREDENTIALS("로그인 실패");

    const user = await auth_service.findUserById(userId);
    if (!user) throw new INVALID_CREDENTIALS("로그인 실패");

    await auth_service.deleteUserById(userId);

    res.status(204);
}

