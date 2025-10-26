import express from "express"
import cors from "cors"
import helmet from "helmet"

const app = express()
app.use(helmet())

// Enable CORS for all routes
app.use(cors())

// Parse JSON bodies
app.use(express.json())

import {router} from "./routes/mainrouter.router.js"
app.use("/user", router)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


export {app}
