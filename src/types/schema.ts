import { z } from "zod";




export const signupSchema = z.object({
    nickname: z.string().min(1, "닉네임은 필수 입력값입니다"),
    email: z.string().email("이메일 형식이 올바르지 않습니다"),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
    category: z.string().min(1, "카테고리는 필수 입력값입니다"),
    choosed: z.string().min(1, "캐릭터를 선택해주세요")
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


export const updateUserSchema = z.object({
    nickname: z.string().min(1, "닉네임은 필수 입력값입니다").optional(),
    category: z.array(z.string().min(1)).min(1, "카테고리는 최소 하나 이상이어야 합니다").optional(),
    learningPrompt: z.string().optional(),
}).refine((v) => Object.keys(v).length > 0, { message: "수정할 항목이 최소 하나는 필요합니다" })

export type UpdateUserInput = z.infer<typeof updateUserSchema>


export const updateCharacterSchema = z.object({
    name: z.string().min(1, "캐릭터 이름은 비울 수 없습니다").optional(),
    description: z.string().optional(),
}).refine((v) => Object.keys(v).length > 0, { message: "수정할 항목이 최소 하나는 필요합니다" })

export type UpdateCharacterInput = z.infer<typeof updateCharacterSchema>


// 카드게임 관련 스키마


//---------- DB 저장용 ----------

// explaination 제외: iOS 는 카드 문항에서 {index, question} 만 디코드하고 해설을 표시하지 않는다.
// 15문항분 해설을 매번 생성하느라 출제가 35% 느려진다. (퀴즈 채점의 해설은 별개로 유지)
export const CardGameQuestionSchema = z.array(z.object({
    index: z.number(),
    question: z.string(),
    answer: z.boolean(),
}))

export const CardGameQuestionsResponseSchema = z.object({
    questions: CardGameQuestionSchema,
})


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

export const QuizGameQuestionsResponseSchema = z.object({
    questions: QuizGameQuestionSchema,
})

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

// AI 채점 출력용. z.date()는 JSON Schema로 표현할 수 없어 endTime을 제외한다.
export const QuizGameGradeSchema = QuizGameResultSchema.omit({ endTime: true })

export type QuizGameQuestionType = z.infer<typeof QuizGameQuestionSchema>
export type QuizGameResultType = z.infer<typeof QuizGameResultSchema>
export type QuizGameGradeType = z.infer<typeof QuizGameGradeSchema>


// ---------- req용 ----------

// JSON에는 Date 타입이 없어 문자열로 들어온다.
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


// ---------- query / path 파라미터 ----------

export const GameTypeSchema = z.enum(["CARD", "QUIZ", "CHAT"])
export const PeriodSchema = z.enum(["day", "week", "month"])

const take = z.coerce.number().int().positive().max(100).default(20)
const skip = z.coerce.number().int().min(0).default(0)

export const HistoryListQuerySchema = z.object({
    type: GameTypeSchema.optional(),
    take,
    skip,
})

export const HistoryPeriodQuerySchema = z.object({
    period: PeriodSchema.default("day"),
    take,
    skip,
})

/** 날짜 구간 조회. from/to는 ISO 문자열 또는 YYYY-MM-DD. */
export const HistoryRangeQuerySchema = z.object({
    from: z.coerce.date(),
    to: z.coerce.date(),
    type: GameTypeSchema.optional(),
    take,
    skip,
}).refine((v) => v.from <= v.to, {
    message: "from은 to보다 이후일 수 없습니다",
    path: ["from"],
})

export const LeagueTopQuerySchema = z.object({
    limit: z.coerce.number().int().positive().max(100).default(10),
})

export const HistoryIdParamSchema = z.object({
    historyId: z.string().min(1, "historyId가 필요합니다"),
})

export type HistoryListQueryType = z.infer<typeof HistoryListQuerySchema>
export type HistoryPeriodQueryType = z.infer<typeof HistoryPeriodQuerySchema>
export type HistoryRangeQueryType = z.infer<typeof HistoryRangeQuerySchema>
export type LeagueTopQueryType = z.infer<typeof LeagueTopQuerySchema>
export type HistoryIdParamType = z.infer<typeof HistoryIdParamSchema>


// ---------- 대화형 게임 결과 ----------

export const ChatGameResultSchema = z.object({
    endTime: z.coerce.date(),
    turns: z.number(),
    summary: z.string(),
    messages: z.array(z.object({
        role: z.enum(["ai", "user"]),
        content: z.string(),
    })),
})

export type ChatGameResultType = z.infer<typeof ChatGameResultSchema>
