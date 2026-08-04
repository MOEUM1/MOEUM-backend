import type { Request, Response } from "express";
import * as auth_service from "../../services/auth.service.js";
import * as chat_service from "../../services/games/chat.service.js";
import * as game_service from "../../services/games/index.service.js";
import * as analyze_service from "../../services/analyze.service.js";
import * as streak_service from "../../services/streak.service.js";
import * as level_service from "../../services/level.service.js";
import { calcGameExp } from "../../lib/exp.js";
import { HttpError, NOT_FOUND_HISTORY, UNAUTHORIZED } from "../../lib/error.js";
import type { ChatAnswerReqType } from "../../types/schema.js";


/**
 * AI 가르치기 시작 - 대화를 열고 AI의 첫 질문을 내려준다.
 */
export const startChatGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const user = await auth_service.findUserById(userId);
    if (!user) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const subject = user.category[0];
    if (!subject) throw new HttpError(400, "NO_CATEGORY", "학습 분야가 설정되어 있지 않습니다.");

    // 지금까지의 학습 분석을 먼저 알려주고 첫 질문을 받는다.
    const context = await analyze_service.getUserContextText(userId);

    const { studyHistory, conversationId, response } = await chat_service.initExamGame(userId, subject, context);

    // 대화형 게임은 사전 생성 문제가 없으므로 questions는 비워두고 conversationId만 연결한다.
    await game_service.setQuestionWithConversation(studyHistory.id, conversationId, []);

    res.status(201).json({
        historyId: studyHistory.id,
        subject,
        question: response.output_text,
        createdAt: studyHistory.createdAt.toISOString(),
    });
}


/**
 * AI 가르치기 답변 전송 - 사용자가 가르친 내용을 보내고 다음 질문을 받는다.
 */
export const answerChatGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const historyId = req.params["historyId"];
    if (typeof historyId !== "string") throw new HttpError(400, "VALIDATION_ERROR", "historyId가 필요합니다.");

    const { answer } = req.body as ChatAnswerReqType;

    const history = await game_service.getGameHistoryById(historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY("학습 기록을 찾을 수 없습니다.");
    if (history.type !== "CHAT") throw new HttpError(400, "VALIDATION_ERROR", "대화형 게임 기록이 아닙니다.");

    const conversationId = history.aiconversations?.conversationId;
    if (!conversationId) throw new NOT_FOUND_HISTORY("대화를 찾을 수 없습니다.");

    const response = await chat_service.sendAnswerToExamGame(conversationId, answer);

    res.status(200).json({
        historyId,
        question: response.output_text,
    });
}


/**
 * AI 가르치기 종료 - 마지막 답변을 보내고 총평을 받는다.
 */
export const endChatGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED("알 수 없는 사용자입니다.");

    const historyId = req.params["historyId"];
    if (typeof historyId !== "string") throw new HttpError(400, "VALIDATION_ERROR", "historyId가 필요합니다.");

    const { answer } = req.body as ChatAnswerReqType;

    const history = await game_service.getGameHistoryById(historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY("학습 기록을 찾을 수 없습니다.");
    if (history.type !== "CHAT") throw new HttpError(400, "VALIDATION_ERROR", "대화형 게임 기록이 아닙니다.");

    const conversationId = history.aiconversations?.conversationId;
    if (!conversationId) throw new NOT_FOUND_HISTORY("대화를 찾을 수 없습니다.");

    const summary = await chat_service.resultAnswerToExamGame(conversationId, answer);
    await streak_service.touchStreak(userId);

    // 대화형 게임은 정답률 지표가 없어 고정 경험치만 지급한다.
    const levelUp = await level_service.addExp(userId, calcGameExp("CHAT"));

    // TODO: 대화형 게임 결과를 StudyHistory.result에 저장하는 서비스 추가 후 연결
    res.status(200).json({
        historyId,
        summary,
        levelUp,
    });

    // 응답을 보낸 뒤 최근 게임 기반 분석을 백그라운드로 실행한다.
    analyze_service.runAnalyzeInBackground(userId);
}
