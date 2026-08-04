import { Router } from "express";
import * as auth_controller from "../controllers/auth.controller.js";
import * as user_controller from "../controllers/user.controller.js";
import { requireAuth } from "../middlewares/auth.middleware.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { deleteAccountSchema, updateUserSchema } from "../types/schema.js";



const router = Router();

router.get("/me", requireAuth, auth_controller.getMyInfo);
router.patch("/me", requireAuth, validateBody(updateUserSchema), user_controller.updateMyInfo);
router.delete("/me", requireAuth, validateBody(deleteAccountSchema), auth_controller.deleteMyAccount);

router.get("/me/categories", requireAuth, user_controller.getMyCategories);
router.get("/me/streak", requireAuth, user_controller.getMyStreak);


export default router;
