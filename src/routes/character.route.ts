import { Router } from "express";
import * as controller from "../controllers/character.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { updateCharacterSchema } from "../types/schema.js";



const router = Router();

router.get("/me", requireAuth, controller.getMyCharacter);
router.patch("/me", requireAuth, validateBody(updateCharacterSchema), controller.updateMyCharacter);
router.get("/me/level", requireAuth, controller.getMyLevel);


export default router;
