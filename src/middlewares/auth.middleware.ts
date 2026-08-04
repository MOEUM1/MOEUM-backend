import passport from "passport";
import type { NextFunction, Request, Response } from "express";
import { UNAUTHORIZED } from "../lib/error.js";

export const requireAuth = (req: Request, res: Response, next: NextFunction) => {
  passport.authenticate(
    "jwt",
    { session: false },
    (err: unknown, user: Express.User | false) => {
      if (err) return next(err);
      if (!user) return next(new UNAUTHORIZED("알 수 없는 사용자입니다."));
      req.user = user;
      next();
    }
  )(req, res, next);
};