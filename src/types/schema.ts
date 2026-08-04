import { z } from "zod";




export const signupSchema = z.object({
    nickname: z.string().min(1, "닉네임은 필수 입력값입니다"),
    email: z.string().email("이메일 형식이 올바르지 않습니다"),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
    category: z.string().min(1, "카테고리는 필수 입력값입니다"),
    choosed: z.string()
})

export type SignupInput = z.infer<typeof signupSchema>

export const signinSchema = z.object({
    email: z.string().email("이메일 형식이 올바르지 않습니다"),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
})

export type SigninInput = z.infer<typeof signinSchema>


export const deleteAccountSchema = z.object({
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
})

export type DeleteAccountInput = z.infer<typeof deleteAccountSchema>


// 카드게임 관련 스키마


//---------- DB 저장용 ----------

export const CardGameQuestionSchema = z.array(z.object({
    index: z.number(),
    question: z.string(),
    answer: z.boolean(),
    explaination: z.string(),
}))


export const CardGameResultSchema = z.object({
    endTime: z.date(),
    correctIndex: z.array(z.number()),
    wrongIndex: z.array(z.number()),
    questions: CardGameQuestionSchema,
})


export type CardGameQuestionType = z.infer<typeof CardGameQuestionSchema>
export type CardGameResultType = z.infer<typeof CardGameResultSchema>

// 퀴즈게임 관련 스키마
export const QuizGameQuestionSchema = z.array(z.object({
    index: z.number(),
    question: z.string(),
}))

export const QuizGameResultSchema = z.object({
    endTime: z.date(),
    correctCount: z.number(),
    wrongCount: z.number(),
    grade: z.array(z.object({
        index: z.number(),
        answer: z.string(),
        isCorrect: z.boolean(),
        correctAnswer: z.string(),
        explaination: z.string(),
    }))
})

export type QuizGameQuestionType = z.infer<typeof QuizGameQuestionSchema>
export type QuizGameResultType = z.infer<typeof QuizGameResultSchema>


// ---------- req용 ----------

// JSON 요청에는 Date 타입이 없어 문자열로 들어오므로 coerce로 받는다.
export const CardGameResultReqSchema = CardGameResultSchema.omit({ questions: true }).extend({
    endTime: z.coerce.date(),
})

export const QuizGameResultReqSchema = z.object({
    historyId: z.string(),
    input: z.array(z.object({
        index:z.number(),
        answer:z.string(),
    })),
    endAt: z.coerce.date(),
})

export const ChatAnswerReqSchema = z.object({
    answer: z.string().min(1, "답변은 필수 입력값입니다"),
})

export type CardGameResultReqType = z.infer<typeof CardGameResultReqSchema>
export type QuizGameResultReqType = z.infer<typeof QuizGameResultReqSchema>
export type ChatAnswerReqType = z.infer<typeof ChatAnswerReqSchema>

