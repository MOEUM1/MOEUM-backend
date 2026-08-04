import { z } from "zod";


export const env = z.object({
    DATABASE_URL: z.string().min(1),
    PORT: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1),
}).parse(process.env)