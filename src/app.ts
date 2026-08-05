import express from "express";
import helmet from "helmet";
import type { Request, Response } from "express";
import { ErrorHandler, NotFoundHandler } from "./middlewares/error.middleware.js";
import { configurePassport } from "./passport/jwt.strategy.js";
import passport from "passport";
import authRouter from "./routes/auth.route.js";
import characterRouter from "./routes/character.route.js";
import gameRouter from "./routes/games/index.route.js";
import historyRouter from "./routes/history.route.js";
import leagueRouter from "./routes/league.route.js";
import userRouter from "./routes/user.route.js";
import analyzeRouter from "./routes/analyze.route.js";
import { prisma } from "./lib/prisma.js";


const app = express();
app.use(helmet());
app.use(express.json());

configurePassport();
app.use(passport.initialize());

app.use("/api/health", async (_req:Request, res:Response) => {
    try {
        await prisma.$queryRaw`SELECT 1`;
        res.status(200).json({ status: "ok", version: "1.0.0", database: "ok" });
    } catch (error) {
        console.error("[health] database unavailable", error);
        res.status(503).json({ status: "degraded", version: "1.0.0", database: "unavailable" });
    }
})

app.use("/api/auth", authRouter);
app.use("/api/users", userRouter);
app.use("/api/analyses", analyzeRouter);
app.use("/api/characters", characterRouter);
app.use("/api/games", gameRouter);
app.use("/api/histories", historyRouter);
app.use("/api/leagues", leagueRouter);


//여기서부턴 에러 핸들러
app.use(NotFoundHandler);
app.use(ErrorHandler);



export default app;
