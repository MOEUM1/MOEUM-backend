import { Router } from "express";
import * as controller from "../controllers/analyze.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";



const router = Router();

router.get("/me", requireAuth, controller.getMyAnalysis);
router.post("/me", requireAuth, controller.requestAnalysis);
router.get("/me/source", requireAuth, controller.getAnalysisSource);


export default router;
