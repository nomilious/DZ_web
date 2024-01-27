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
    console.log(req.method, req.baseUrl || req.url, new Date().toISOString());
    next();
});

// middleware for static app files
const ss = path.resolve(__dirname, "../dist");

app.use("/", express.static(path.resolve(__dirname, "../frontend/dist")));

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
    // console.log(await db.getTaskLists(), await db.getTasks());
});
process.on("SIGTERM", () => {
    console.log("SIGTERM signal received: closing HTTP server");
    server.close(async () => {
        await db.disconnect();
        console.log("HTTP server closed");
    });
});
