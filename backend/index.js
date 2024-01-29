import express from "express";
import dotenv from "dotenv";
import DB from "./db/client.js";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config({
    path: "./backend/.env",
});

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app_host = process.env.APP_HOST;
const app_port = process.env.APP_PORT;

const app = express();
const db = new DB();

// logging middleware
app.use("*", (req, res, next) => {
    console.log(
        req.method,
        res.statusCode,

        req.baseUrl || req.url,
        new Date().toLocaleTimeString()
    );
    next();
});

// middleware for static app files
app.use("/", express.static(path.resolve(__dirname, "../frontend/dist")));

app.get("/workers", async (req, res) => {
    try {
        const data = await db.getWorkers();
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.json({ data });
    } catch (error) {
        res.statusCode = 500;
        res.statusMessage = "Error";
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Getting workers error: ${error}`,
        });
    }
});
app.get("/requests", async (req, res) => {
    try {
        const data = await db.getRequests();
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.json({ data });
    } catch (error) {
        res.statusCode = 500;
        res.statusMessage = "Error";
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Getting requests error: ${error}`,
        });
    }
});

const server = app.listen(Number(app_port), app_host, async () => {
    try {
        db.connect();
    } catch (error) {
        console.error(error);
        process.exit();
    }
    console.log(
        `Task manager backend started at http://${app_host}:${app_port}`
    );
});
process.on("SIGINT", () => {
    console.log("SIGINT signal received: closing HTTP server");
    server.close(async () => {
        await db.disconnect();
        console.log("HTTP server closed");
    });
});