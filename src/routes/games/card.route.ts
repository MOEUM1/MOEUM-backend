import { Router } from "express";
import * as controller from "../../controllers/games/card.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody, validateParams } from "../../middlewares/validate.middleware.js";
import { CardGameResultReqSchema, HistoryIdParamSchema } from "../../types/schema.js";
import { keepAnalysis } from "../../middlewares/analyseRoutine.middleware.js";


const router = Router();

router.post("/", requireAuth, controller.startCardGame);
router.post(
    "/:historyId/result",
    requireAuth,
    validateParams(HistoryIdParamSchema),
    validateBody(CardGameResultReqSchema),
    keepAnalysis("game"),
    controller.submitCardGame
);


export default router;
