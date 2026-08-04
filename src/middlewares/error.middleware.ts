import type { NextFunction, Request, Response } from "express";
import { HttpError } from "../lib/error.js";
import { ZodError } from "zod";



export const ErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
        return res.status(err.status).json({
            error:{
                code:err.code,
                message:err.message
            }
        })
    }

    if (err instanceof ZodError) {
        return res.status(400).json({
            error:{
                code: "VALIDATION_ERROR",
                message: err.message,
                details: err.issues.map((issue) => ({
                    field: issue.path.join("."),
                    message: issue.message
                }))
            }
        })
    }

    console.error(err);
    return res.status(500).json({
        error: {
            code: "INTERNAL_ERROR",
            message: "서버 오류가 발생하였습니다"
        }
    })
}