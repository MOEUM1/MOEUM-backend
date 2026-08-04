import { Router } from "express";
import * as controller from "../controllers/league.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";



const router = Router();

// GET /api/leagues/top?limit=10 - 상위 N명의 레벨/경험치
router.get("/top", requireAuth, controller.getTopRanking);


export default router;
