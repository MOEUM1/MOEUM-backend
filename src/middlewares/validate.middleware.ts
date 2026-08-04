import type { NextFunction, Request, Response } from "express";
import type { ZodTypeAny } from "zod";



export const validateBody = (schema: ZodTypeAny) => (req: Request, res: Response, next: NextFunction) => {
    try {
        const parsed = schema.safeParse(req.body);

        if (!parsed.success) {
            return res.status(400).json({
                error: {
                    code: "VALIDATION_ERROR",
                    message: "요청이 형식에 맞지 않습니다",
                    details: parsed.error.issues.map((issue) => ({
                        field: issue.path.join("."),
                        message: issue.message
                    }))
                }
            })
        }
        req.body = parsed.data;
        next();
        
    } catch (error) {
        throw new Error("Validation middleware error: " + (error as Error).message);
    }
}