import { Router } from "express";
import * as controller from "../controllers/league.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateQuery } from "../middlewares/validate.middleware.js";
import { LeagueTopQuerySchema } from "../types/schema.js";


const router = Router();

router.get("/top", requireAuth, validateQuery(LeagueTopQuerySchema), controller.getTopRanking);
router.get("/me", requireAuth, controller.getMyRank);


export default router;
