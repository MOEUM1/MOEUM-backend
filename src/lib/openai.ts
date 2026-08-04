import OpenAI from "openai";
import { env } from "../config";


export const client = new OpenAI({
    apiKey: env.OPENAI_API_KEY,
});
