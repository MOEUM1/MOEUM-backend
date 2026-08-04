import { Router } from "express";
import * as controller from "../controllers/auth.controller.js";
import { validateBody } from "../middlewares/validate.middleware.js";
import { signinSchema, signupSchema } from "../types/schema.js";



const router = Router();

router.post("/signup", validateBody(signupSchema), controller.signUp);
router.post("/signin", validateBody(signinSchema), controller.signIn);


export default router;