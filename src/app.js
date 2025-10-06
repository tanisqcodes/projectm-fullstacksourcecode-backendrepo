import express from "express"
import cors from "cors"

const app = express()

// Enable CORS for all routes
app.use(cors({
    origin: 'http://localhost:5173', // Vite default port
    credentials: true
}))

// Parse JSON bodies
app.use(express.json())

import {router} from "./routes/mainrouter.router.js"
app.use("/user", router)


export {app}
