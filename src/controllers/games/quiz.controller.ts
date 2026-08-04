import type { Request, Response } from "express";
import * as auth_service from "../../services/auth.service.js";
import * as quiz_service from "../../services/games/quiz.service.js";
import * as game_service from "../../services/games/index.service.js";
import { HttpError, NOT_FOUND_HISTORY, UNAUTHORIZED } from "../../lib/error.js";
import type { QuizGameResultReqType } from "../../types/schema.js";


/**
 * 퀴즈게임 시작 - 서술형 문제를 AI로 생성하고 대화(conversation)와 함께 저장한다.
 */
export const startQuizGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const user = await auth_service.findUserById(userId);
    if (!user) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const subject = user.category[0];
    if (!subject) throw new HttpError(400, "NO_CATEGORY", "학습 분야가 설정되어 있지 않습니다.");

    const history = await quiz_service.createQuizGameHistory(userId);
    const { response: questions, conversationId } = await quiz_service.generateQuizGameQuestions(subject);
    await game_service.setQuestionWithConversation(history.id, conversationId, questions);

    res.status(201).json({
        historyId: history.id,
        subject,
        questions,
        createdAt: history.createdAt.toISOString(),
    });
}


/**
 * 퀴즈게임 답안 제출 - AI로 채점한 뒤 결과를 저장한다.
 */
export const submitQuizGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const body = req.body as QuizGameResultReqType;

    const history = await game_service.getGameHistoryById(body.historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY("학습 기록을 찾을 수 없습니다.");
    if (history.type !== "QUIZ") throw new HttpError(400, "VALIDATION_ERROR", "퀴즈게임 기록이 아닙니다.");

    const graded = await quiz_service.gradeQuizGameResult(body);
    await quiz_service.setQuizGameResult(body.historyId, graded);

    res.status(200).json({
        historyId: body.historyId,
        correctCount: graded.correctCount,
        wrongCount: graded.wrongCount,
        grade: graded.grade,
        endTime: graded.endTime,
    });
}
