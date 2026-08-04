import { Router } from "express";
import * as controller from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateParams, validateQuery } from "../middlewares/validate.middleware.js";
import {
    HistoryIdParamSchema,
    HistoryListQuerySchema,
    HistoryPeriodQuerySchema,
    HistoryRangeQuerySchema,
} from "../types/schema.js";


const router = Router();

router.get("/", requireAuth, validateQuery(HistoryListQuerySchema), controller.getHistories);

// 고정 경로를 :historyId 보다 먼저 등록해야 id로 잡히지 않는다.
router.get("/summary", requireAuth, validateQuery(HistoryPeriodQuerySchema), controller.getPeriodSummary);
router.get("/detail", requireAuth, validateQuery(HistoryPeriodQuerySchema), controller.getPeriodDetail);
router.get("/range", requireAuth, validateQuery(HistoryRangeQuerySchema), controller.getRangeHistories);

router.get("/:historyId", requireAuth, validateParams(HistoryIdParamSchema), controller.getHistory);


export default router;
