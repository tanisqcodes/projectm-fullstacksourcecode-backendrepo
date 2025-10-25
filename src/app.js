import express from "express"
import cors from "cors"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()

// Enable CORS for all routes
app.use(cors({ // currently app accepts requests from vite-react server
    origin: 'http://localhost:8000', // Vite default port
    credentials: true 
}))

// parse JSON bodies
app.use(express.json()) 

// serve the static HTML site from the public_html directory
app.use(express.static(path.join(__dirname, '..', '..', 'public_html'))) 


// serve the React app from the frontend/dist directory
app.use("/app", express.static(path.join(__dirname, '..', '..', 'frontend', 'dist')))

// backend api routes
import {router} from "./routes/mainrouter.router.js"
app.use("/api/user", router)

// If a user deep-links (e.g., refreshes /app/dashboard),
// this makes sure to send them the main index.html so React Router can take over.
app.get(/\/app.*/ , (req, res) => {
    res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'dist', 'index.html'));
}); 


export {app}
