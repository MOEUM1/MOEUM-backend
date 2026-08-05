import { createServer } from "http";
import app from "./app.js";
import { env } from "./config.js";
import { connectRedis } from "./lib/redis.js";


await connectRedis();

const httpServer = createServer(app)

httpServer.listen(Number(env.PORT), () => {
    console.log(`Server is running on port ${env.PORT}`)
    console.log(`http://localhost:${env.PORT}`)
})
