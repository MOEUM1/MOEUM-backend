import type { Request, Response } from "express";
import * as auth_service from "../../services/auth.service.js";
import * as card_service from "../../services/games/card.service.js";
import * as game_service from "../../services/games/index.service.js";
import { HttpError, NOT_FOUND_HISTORY, UNAUTHORIZED } from "../../lib/error.js";
import type { CardGameQuestionType, CardGameResultReqType, CardGameResultType } from "../../types/schema.js";


/**
 * 카드게임 시작 - OX 문제를 AI로 생성하고 StudyHistory에 저장한다.
 * 정답/해설은 채점 전까지 내려주지 않는다.
 */
export const startCardGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const user = await auth_service.findUserById(userId);
    if (!user) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const subject = user.category[0];
    if (!subject) throw new HttpError(400, "NO_CATEGORY", "학습 분야가 설정되어 있지 않습니다.");

    const history = await game_service.createGameHistory(userId, "CARD");
    const questions = await card_service.generateCardGameQuestions(subject);
    await card_service.setCardGameQuestions(history.id, questions);

    res.status(201).json({
        historyId: history.id,
        subject,
        questions: questions.map(({ index, question }) => ({ index, question })),
        createdAt: history.createdAt.toISOString(),
    });
}


/**
 * 카드게임 결과 제출 - 클라이언트가 보낸 채점 결과에 문제 원본을 합쳐 저장한다.
 */
export const submitCardGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const historyId = req.params["historyId"];
    if (typeof historyId !== "string") throw new HttpError(400, "VALIDATION_ERROR", "historyId가 필요합니다.");

    const history = await game_service.getGameHistoryById(historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY("학습 기록을 찾을 수 없습니다.");
    if (history.type !== "CARD") throw new HttpError(400, "VALIDATION_ERROR", "카드게임 기록이 아닙니다.");

    const { endTime, correctIndex, wrongIndex } = req.body as CardGameResultReqType;
    const questions = history.question as CardGameQuestionType;

    const result: CardGameResultType = { endTime, correctIndex, wrongIndex, questions };
    await card_service.setCardGameResult(historyId, result);

    res.status(200).json({
        historyId,
        correctCount: correctIndex.length,
        wrongCount: wrongIndex.length,
        totalCount: questions.length,
        questions,
    });
}
