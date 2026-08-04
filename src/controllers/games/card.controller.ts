import type { Request, Response } from "express";
import * as auth_service from "../../services/auth.service.js";
import * as card_service from "../../services/games/card.service.js";
import * as game_service from "../../services/games/index.service.js";
import * as analyze_service from "../../services/analyze.service.js";
import * as streak_service from "../../services/streak.service.js";
import * as level_service from "../../services/level.service.js";
import { calcGameExp } from "../../lib/exp.js";
import { NO_CATEGORY, NOT_FOUND_HISTORY, NOT_FOUND_USER, UNAUTHORIZED, VALIDATION_ERROR } from "../../lib/error.js";
import type { CardGameQuestionType, CardGameResultReqType, CardGameResultType, HistoryIdParamType } from "../../types/schema.js";


/** 정답/해설은 채점 전까지 내려주지 않는다. */
export const startCardGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const user = await auth_service.findUserById(userId);
    if (!user) throw new NOT_FOUND_USER();

    const subject = user.category[0];
    if (!subject) throw new NO_CATEGORY();

    const context = await analyze_service.getUserContextText(userId);

    const history = await game_service.createGameHistory(userId, "CARD");
    const questions = await card_service.generateCardGameQuestions(subject, context);
    await card_service.setCardGameQuestions(history.id, questions);

    res.status(201).json({
        historyId: history.id,
        subject,
        questions: questions.map(({ index, question }) => ({ index, question })),
        createdAt: history.createdAt.toISOString(),
    });
}


export const submitCardGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { historyId } = res.locals["params"] as HistoryIdParamType;

    const history = await game_service.getGameHistoryById(historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY();
    if (history.type !== "CARD") throw new VALIDATION_ERROR("카드게임 기록이 아닙니다");

    const questions = (history.question ?? null) as CardGameQuestionType | null;
    if (!questions) throw new VALIDATION_ERROR("문제가 생성되지 않은 기록입니다");

    const { endTime, correctIndex, wrongIndex } = req.body as CardGameResultReqType;

    const result: CardGameResultType = { endTime, correctIndex, wrongIndex, questions };
    await card_service.setCardGameResult(historyId, result);
    await streak_service.touchStreak(userId);

    // 분모는 제출 문항 수가 아니라 출제 문항 수다.
    const accuracy = questions.length > 0 ? correctIndex.length / questions.length : 0;
    const levelUp = await level_service.addExp(userId, calcGameExp("CARD", accuracy));

    res.status(200).json({
        historyId,
        correctCount: correctIndex.length,
        wrongCount: wrongIndex.length,
        totalCount: questions.length,
        questions,
        levelUp,
    });

    analyze_service.runAnalyzeInBackground(userId);
}
