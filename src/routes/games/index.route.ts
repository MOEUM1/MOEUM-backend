import { Router } from "express";
import cardRouter from "./card.route.js";
import quizRouter from "./quiz.route.js";
import chatRouter from "./chat.route.js";



const router = Router();

router.use("/card", cardRouter);
router.use("/quiz", quizRouter);
router.use("/chat", chatRouter);


export default router;
