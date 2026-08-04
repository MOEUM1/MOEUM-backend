import express from "express";
import helmet from "helmet";
import type { Request, Response } from "express";


const app = express();
app.use(helmet());
app.use(express.json());

app.use("/api/health", (_req:Request, res:Response) => {
    res.status(200).json({ status: "ok" });
})



export default app;