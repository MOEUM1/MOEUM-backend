import { Router } from "express";
import * as controller from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";



const router = Router();

// GET /api/histories?type=CARD&take=20&skip=0
router.get("/", requireAuth, controller.getHistories);

// 기간별 조회 (period = day | week | month)
// :historyId 보다 먼저 등록해야 "summary" 가 id로 잡히지 않는다.
router.get("/summary", requireAuth, controller.getPeriodSummary);
router.get("/detail", requireAuth, controller.getPeriodDetail);

router.get("/:historyId", requireAuth, controller.getHistory);


export default router;
