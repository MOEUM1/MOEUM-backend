import { Router } from "express";
import * as controller from "../../controllers/games/quiz.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { QuizGameResultReqSchema } from "../../types/schema.js";
import { keepAnalysis } from "../../middlewares/analyseRoutine.middleware.js";



const router = Router();

router.post("/", requireAuth, controller.startQuizGame);
// historyId는 QuizGameResultReqSchema 안에 포함되어 있어 body로 받는다.
router.post("/result", requireAuth, validateBody(QuizGameResultReqSchema),keepAnalysis("game"), controller.submitQuizGame);


export default router;
