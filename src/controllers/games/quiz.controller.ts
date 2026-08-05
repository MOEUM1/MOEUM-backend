import type { Request, Response } from "express";
import * as auth_service from "../../services/auth.service.js";
import * as quiz_service from "../../services/games/quiz.service.js";
import * as game_service from "../../services/games/index.service.js";
import * as analyze_service from "../../services/analyze.service.js";
import * as streak_service from "../../services/streak.service.js";
import * as level_service from "../../services/level.service.js";
import { memGetGameHistories, memSaveGameHistory, REVIEW_HISTORY_TAKE } from "../../services/historyMemory.service.js";
import { calcGameExp } from "../../lib/exp.js";
import { NO_CATEGORY, NOT_FOUND_HISTORY, NOT_FOUND_USER, UNAUTHORIZED, VALIDATION_ERROR } from "../../lib/error.js";
import type { QuizGameQuestionType, QuizGameResultReqType } from "../../types/schema.js";


export const startQuizGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const user = await auth_service.findUserById(userId);
    if (!user) throw new NOT_FOUND_USER();

    const subject = user.category[0];
    if (!subject) throw new NO_CATEGORY();

    const context = await analyze_service.getUserContextText(userId);
    const recent = await memGetGameHistories(userId, REVIEW_HISTORY_TAKE);

    const history = await quiz_service.createQuizGameHistory(userId);
    const { response: questions, conversationId } = await quiz_service.generateQuizGameQuestions(subject, context, recent);
    await game_service.setQuestionWithConversation(history.id, conversationId, questions);

    res.status(201).json({
        historyId: history.id,
        subject,
        questions,
        createdAt: history.createdAt.toISOString(),
    });
}


export const submitQuizGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const body = req.body as QuizGameResultReqType;

    const history = await game_service.getGameHistoryById(body.historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY();
    if (history.type !== "QUIZ") throw new VALIDATION_ERROR("퀴즈게임 기록이 아닙니다");

    const questions = (history.question ?? null) as QuizGameQuestionType | null;
    if (!questions) throw new VALIDATION_ERROR("문제가 생성되지 않은 기록입니다");

    const graded = await quiz_service.gradeQuizGameResult(body);
    await quiz_service.setQuizGameResult(body.historyId, graded);
    await streak_service.touchStreak(userId);

    // 분모는 채점된 문항 수가 아니라 출제 문항 수다.
    const wrongQuestions = graded.grade
        .filter((g) => !g.isCorrect)
        .map((g) => questions.find((q) => q.index === g.index)?.question)
        .filter((q): q is string => Boolean(q));
    await memSaveGameHistory(userId, "QUIZ", JSON.stringify(wrongQuestions), `정답 ${graded.correctCount}/${questions.length}`);

    const totalCount = questions.length;
    const accuracy = totalCount > 0 ? graded.correctCount / totalCount : 0;
    const levelUp = await level_service.addExp(userId, calcGameExp("QUIZ", accuracy));

    res.status(200).json({
        historyId: body.historyId,
        correctCount: graded.correctCount,
        wrongCount: graded.wrongCount,
        totalCount,
        grade: graded.grade,
        endTime: graded.endTime,
        levelUp,
    });

    if (res.locals["goAnalysis"]) analyze_service.runAnalyzeInBackground(userId);
}
