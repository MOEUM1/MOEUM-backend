import { Router } from "express";
import * as controller from "../../controllers/games/chat.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { ChatAnswerReqSchema } from "../../types/schema.js";



const router = Router();

router.post("/", requireAuth, controller.startChatGame);
router.post("/:historyId/answer", requireAuth, validateBody(ChatAnswerReqSchema), controller.answerChatGame);
router.post("/:historyId/end", requireAuth, validateBody(ChatAnswerReqSchema), controller.endChatGame);


export default router;
