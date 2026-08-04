import { Router } from "express";
import * as controller from "../controllers/character.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";



const router = Router();

router.get("/me", requireAuth, controller.getMyCharacter);
router.get("/me/level", requireAuth, controller.getMyLevel);


export default router;
