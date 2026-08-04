import { Router } from "express";
import * as controller from "../../controllers/games/chat.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { ChatAnswerReqSchema, HistoryIdParamSchema } from "../../types/schema.js";


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
    controller.endChatGame
);


export default router;
