import type { Request, Response } from "express";
import * as auth_service from "../../services/auth.service.js";
import * as chat_service from "../../services/games/chat.service.js";
import * as game_service from "../../services/games/index.service.js";
import * as analyze_service from "../../services/analyze.service.js";
import * as streak_service from "../../services/streak.service.js";
import * as level_service from "../../services/level.service.js";
import { memSaveGameHistory } from "../../services/historyMemory.service.js";
import { calcGameExp } from "../../lib/exp.js";
import { NO_CATEGORY, NOT_FOUND_HISTORY, NOT_FOUND_USER, UNAUTHORIZED, VALIDATION_ERROR } from "../../lib/error.js";
import type { ChatAnswerReqType, ChatGameResultType, HistoryIdParamType } from "../../types/schema.js";


type ChatMessage = { role: "ai" | "user"; content: string };


const loadChatHistory = async (userId: string, historyId: string) => {
    const history = await game_service.getGameHistoryById(historyId);
    if (!history || history.userId !== userId) throw new NOT_FOUND_HISTORY();
    if (history.type !== "CHAT") throw new VALIDATION_ERROR("대화형 게임 기록이 아닙니다");

    const conversationId = history.aiconversations?.conversationId;
    if (!conversationId) throw new NOT_FOUND_HISTORY("대화를 찾을 수 없습니다");

    return { history, conversationId };
}


export const startChatGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const user = await auth_service.findUserById(userId);
    if (!user) throw new NOT_FOUND_USER();

    const subject = user.category[0];
    if (!subject) throw new NO_CATEGORY();

    const context = await analyze_service.getUserContextText(userId);
    const { studyHistory, conversationId, response } = await chat_service.initExamGame(userId, subject, context);

    await game_service.setQuestionWithConversation(studyHistory.id, conversationId, []);
    await game_service.appendConversationMessages(studyHistory.id, [
        { role: "ai", content: response.output_text },
    ]);

    res.status(201).json({
        historyId: studyHistory.id,
        subject,
        question: response.output_text,
        createdAt: studyHistory.createdAt.toISOString(),
    });
}


export const answerChatGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { historyId } = res.locals["params"] as HistoryIdParamType;
    const { answer } = req.body as ChatAnswerReqType;

    const { conversationId } = await loadChatHistory(userId, historyId);
    const response = await chat_service.sendAnswerToExamGame(conversationId, answer);

    await game_service.appendConversationMessages(historyId, [
        { role: "user", content: answer },
        { role: "ai", content: response.output_text },
    ]);

    res.status(200).json({
        historyId,
        question: response.output_text,
    });
}


export const endChatGame = async (req: Request, res: Response) => {
    const userId = req.user?.id;
    if (!userId) throw new UNAUTHORIZED();

    const { historyId } = res.locals["params"] as HistoryIdParamType;
    const { answer } = req.body as ChatAnswerReqType;

    const { conversationId } = await loadChatHistory(userId, historyId);
    const summary = await chat_service.resultAnswerToExamGame(conversationId, answer);

    const conv = await game_service.appendConversationMessages(historyId, [
        { role: "user", content: answer },
    ]);
    const messages = (Array.isArray(conv?.messages) ? conv.messages : []) as ChatMessage[];

    const result: ChatGameResultType = {
        endTime: new Date(),
        turns: messages.filter((m) => m.role === "user").length,
        summary,
        messages,
    };
    await chat_service.setChatGameResult(historyId, result);

    const firstQuestion = messages.find((m) => m.role === "ai")?.content ?? "";
    await memSaveGameHistory(userId, "CHAT", firstQuestion, summary.slice(0, 500));

    await streak_service.touchStreak(userId);
    const levelUp = await level_service.addExp(userId, calcGameExp("CHAT"));

    res.status(200).json({
        historyId,
        summary,
        turns: result.turns,
        messages,
        levelUp,
    });

    if (res.locals["goAnalysis"]) analyze_service.runAnalyzeInBackground(userId);
}
