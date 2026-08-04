import express from "express";
import helmet from "helmet";
import type { Request, Response } from "express";
import { ErrorHandler } from "./middlewares/error.middleware.js";
import { configurePassport } from "./passport/jwt.strategy.js";
import passport from "passport";
import authRouter from "./routes/auth.route.js";


const app = express();
app.use(helmet());
app.use(express.json());

configurePassport();
app.use(passport.initialize());

app.use("/api/health", (_req:Request, res:Response) => {
    res.status(200).json({ status: "ok" });
})

app.use("/api/auth", authRouter);


//여기서부턴 에러 핸들러
app.use(ErrorHandler);



export default app;