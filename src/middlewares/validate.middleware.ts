import type { NextFunction, Request, Response } from "express";
import type { ZodType } from "zod";
import { VALIDATION_ERROR } from "../lib/error.js";


const issuesOf = (error: { issues: readonly { path: readonly PropertyKey[]; message: string }[] }) =>
    error.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message }));


export const validateBody = (schema: ZodType) => (req: Request, _res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) throw new VALIDATION_ERROR(undefined, issuesOf(parsed.error));

    req.body = parsed.data;
    next();
}


/**
 * Express 5 의 req.query 는 getter라 재할당할 수 없다.
 * 검증 결과는 res.locals.query 에 담아 컨트롤러가 꺼내 쓴다.
 */
export const validateQuery = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.query);
    if (!parsed.success) throw new VALIDATION_ERROR("쿼리 파라미터가 형식에 맞지 않습니다", issuesOf(parsed.error));

    res.locals["query"] = parsed.data;
    next();
}


export const validateParams = (schema: ZodType) => (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.params);
    if (!parsed.success) throw new VALIDATION_ERROR("경로 파라미터가 형식에 맞지 않습니다", issuesOf(parsed.error));

    res.locals["params"] = parsed.data;
    next();
}
