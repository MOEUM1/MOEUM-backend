import { Router } from "express";
import * as controller from "../../controllers/games/card.controller.js";
import { requireAuth } from "../../middlewares/auth.middleware.js";
import { validateBody } from "../../middlewares/validate.middleware.js";
import { CardGameResultReqSchema } from "../../types/schema.js";



const router = Router();

router.post("/", requireAuth, controller.startCardGame);
router.post("/:historyId/result", requireAuth, validateBody(CardGameResultReqSchema), controller.submitCardGame);


export default router;
