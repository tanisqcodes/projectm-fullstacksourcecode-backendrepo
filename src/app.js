import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"

const app = express()
app.use(helmet())

// Enable CORS for all routes
app.use(cors({ 
    origin: "http://localhost:3000", 
    credentials: true
}))

// Parse JSON bodies
app.use(express.json())
app.use(cookieParser())

import {router} from "./routes/mainrouter.router.js"
app.use("/user", router)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


export {app}
