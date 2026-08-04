import { z } from "zod";


export const env = z.object({
    DATABASE_URL: z.string().min(1),
    PORT: z.string().min(1),
    JWT_SECRET: z.string().min(1),
    JWT_EXPIRES_IN: z.string().min(1),
    OPENAI_API_KEY: z.string().min(1),
    OPENAI_MODEL: z.string().min(1).default("gpt-5.6-luna"),
}).parse(process.env)