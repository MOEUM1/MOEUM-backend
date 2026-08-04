import { z } from "zod";


export const signupSchema = z.object({
    nickname: z.string().min(1, "닉네임은 필수 입력값입니다"),
    email: z.string().email("이메일 형식이 올바르지 않습니다"),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
})

export type SignupInput = z.infer<typeof signupSchema>

export const signinSchema = z.object({
    email: z.string().email("이메일 형식이 올바르지 않습니다"),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
})

export type SigninInput = z.infer<typeof signinSchema>