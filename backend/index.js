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
app.use("/", express.static(path.resolve(__dirname, "../dist")));

app.get("/workers", async (req, res) => {
    try {
        const [workersRaw, requestsRaw, equipmentRaw] = await Promise.all([
            db.getWorkers(),
            db.getRequests(),
            db.getEquipment()
        ]);

        // TRANSFORM RAW REQUEST
        const requests = requestsRaw.map(request => ({
            id: request.id,
            dateStart: request.date_start,
            dateEnd: request.date_end,
            equipment: equipmentRaw.filter(equipment => request.equipment_id === equipment.id)[0]
        }))
        // TRANSFORM RAW workers
        const workers = workersRaw.map(worker => ({
            id: worker.id,
            name: worker.fio,
            requests: requests.filter(req =>
              worker.tasks.indexOf(req.id) !== -1)
        }))


        res.statusCode = 200;
        res.statusMessage = "OK";
        res.json({ data: workers });
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
app.use("/workers", express.json());
app.post("/workers",  async (req, res) => {
    try {
        const {id, fio} = req.body;
        await db.createWorker({id, fio})
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.send();
    } catch (e) {
        res.statusCode = 500;
        res.statusMessage = "Error";
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Creating workers error: ${e}`,
        });
    }
})
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
app.get("/equipment", async (req, res) => {
    try {
        const data = await db.getEquipment();
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.json({ data });
    } catch (error) {
        res.statusCode = 500;
        res.statusMessage = "Error";
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Getting equipment error: ${error}`,
        });
    }
});
app.use("/requests", express.json());
app.post("/requests", async (req, res) => {
    try {
        const { id, startDate,endDate, equipmentId, workerId } = req.body;

        await db.createTask({id, equipmentId, workerId, dateEnd:endDate, dateStart:startDate});
        res.statusCode = 200;
        res.statusMessage = "OK";
        res.send();
    } catch (error) {
        res.statusCode = 500;
        res.statusMessage = "Error";
        res.json({
            timestamp: new Date().toISOString(),
            status: 500,
            message: `Creating requests error: ${error}`,
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
