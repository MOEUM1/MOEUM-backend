import jwt from "jsonwebtoken";
import { env } from "../config.js";
import type { JwtPayload } from "../passport/jwt.strategy.js";

export const signAccessToken = (payload: JwtPayload) =>
  jwt.sign(payload, env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
  });

