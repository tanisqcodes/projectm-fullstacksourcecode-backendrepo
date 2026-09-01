import express from "express"
import cors from "cors"
import helmet from "helmet"
import cookieParser from "cookie-parser"

const app = express()
app.use(helmet())

// Enable CORS for all routes
const allowedOrigins = [
  "http://localhost:3000",
  "https://leetcrack.com",
  "https://www.leetcrack.com",
]

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow non-browser requests (no origin) and any whitelisted origin
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true)
      } else {
        callback(new Error("Not allowed by CORS"))
      }
    },
    credentials: true,
  }),
)

// Parse JSON bodies
app.use(express.json())
app.use(cookieParser())

// Global AOP Request Logger
app.use((req, res, next) => {
  const start = Date.now()
  const timestamp = new Date().toLocaleTimeString()

  res.on("finish", () => {
    const duration = Date.now() - start
    const status = res.statusCode
    const icon = status >= 500 ? "💥" : status >= 400 ? "⚠️" : status >= 300 ? "🔄" : "✅"

    console.log(
      `[${timestamp}] ${icon} ${req.method.padEnd(6)} ${req.originalUrl} ➔ Status: ${status} (${duration}ms)`
    )
  })

  next()
})

import {router} from "./routes/mainrouter.router.js"
app.use("/user", router)
app.use((req, res, next) => {
    res.status(404).json({
        success: false,
        message: "Route not found"
    });
});


export {app}
