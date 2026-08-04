import { Router } from "express";
import * as controller from "../controllers/analyze.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";


const router = Router();

router.get("/me", requireAuth, controller.getMyAnalysis);
router.post("/me", requireAuth, controller.requestAnalysis);
router.get("/me/source", requireAuth, controller.getAnalysisSource);

// 디버그용. 클라이언트에서는 쓰지 않는다.
router.get("/me/context", requireAuth, controller.getMyContext);


export default router;
