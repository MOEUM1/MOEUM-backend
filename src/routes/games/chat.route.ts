import { Router } from "express";
import * as controller from "../../controllers/games/chat.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { ChatAnswerReqSchema, HistoryIdParamSchema } from "../../types/schema.js";
import { keepAnalysis } from "../../middlewares/analyseRoutine.middleware.js";


const router = Router();

router.post("/", requireAuth, controller.startChatGame);
router.post(
    "/:historyId/answer",
    requireAuth,
    validateParams(HistoryIdParamSchema),
    validateBody(ChatAnswerReqSchema),
    controller.answerChatGame
);
router.post(
    "/:historyId/end",
    requireAuth,
    validateParams(HistoryIdParamSchema),
    validateBody(ChatAnswerReqSchema),
    keepAnalysis("game", 24 * 60 * 60, 0),   //채팅은 바로 적용되게끔
    controller.endChatGame
);


export default router;
