import { createServer } from "http";
import app from "./app.js";



const httpServer = createServer(app)

httpServer.listen(Number(process.env.PORT), () => {
    console.log(`Server is running on port ${process.env.PORT}`)
    console.log(`http://localhost:${process.env.PORT}`)
})