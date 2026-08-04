import { Router } from "express";
import * as controller from "../controllers/history.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";



const router = Router();

router.get("/:historyId", requireAuth, controller.getHistory);


export default router;
