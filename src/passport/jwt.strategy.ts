
import passport from "passport";
import { Strategy as JwtStrategy, ExtractJwt } from "passport-jwt";
import { env } from "../config.js";
import { prisma } from "../lib/prisma.js";

export type JwtPayload = {
  id: string;
  email: string;
};

export const configurePassport = () => {
  passport.use(
    "jwt",
    new JwtStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: env.JWT_SECRET,
        algorithms: ["HS256"],
        ignoreExpiration: false,
      },
      async (payload: JwtPayload, done) => {
        try {
          const user = await prisma.user.findUnique({
            where: { id: payload.id },
            select: { id: true, email: true },
          });
          if (!user) return done(null, false);
          return done(null, user);
        } catch (err) {
          return done(err, false);
        }
      }
    )
  );
};