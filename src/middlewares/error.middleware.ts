import type { NextFunction, Request, Response } from "express";
import { ZodError } from "zod";
import { APIError } from "openai";
import { PrismaClientKnownRequestError } from "../generated/prisma/internal/prismaNamespace.js";
import { HttpError } from "../lib/error.js";


const send = (res: Response, status: number, code: string, message: string, details?: unknown) =>
    res.status(status).json({
        error: details === undefined ? { code, message } : { code, message, details },
    });


export const ErrorHandler = (err: Error, _req: Request, res: Response, _next: NextFunction) => {
    if (err instanceof HttpError) {
        return send(res, err.status, err.code, err.message, err.details);
    }

    if (err instanceof ZodError) {
        return send(res, 400, "VALIDATION_ERROR", "요청이 형식에 맞지 않습니다",
            err.issues.map((issue) => ({ field: issue.path.join("."), message: issue.message })));
    }

    // 외부 AI 호출 실패는 서버 버그가 아니므로 500과 구분한다.
    if (err instanceof APIError) {
        console.error("[openai]", err.status, err.message);
        return send(res, 503, "AI_UNAVAILABLE", "AI 서비스를 일시적으로 사용할 수 없습니다");
    }

    if (err instanceof PrismaClientKnownRequestError) {
        console.error("[prisma]", err.code, err.message);
        if (err.code === "P2002") {
            const target = (err.meta as { target?: string[] } | undefined)?.target?.join(", ");
            return send(res, 409, "CONFLICT", target ? `이미 사용 중인 값입니다: ${target}` : "이미 존재합니다");
        }
        if (err.code === "P2025") return send(res, 404, "NOT_FOUND", "대상을 찾을 수 없습니다");
        if (err.code === "P2003") return send(res, 400, "BAD_REQUEST", "참조하는 대상이 존재하지 않습니다");
        return send(res, 500, "DATABASE_ERROR", "데이터베이스 오류가 발생하였습니다");
    }

    console.error(err);
    return send(res, 500, "INTERNAL_ERROR", "서버 오류가 발생하였습니다");
}


/** 등록되지 않은 경로. 라우터 뒤, ErrorHandler 앞에 둔다. */
export const NotFoundHandler = (_req: Request, res: Response) =>
    send(res, 404, "NOT_FOUND", "존재하지 않는 경로입니다");
