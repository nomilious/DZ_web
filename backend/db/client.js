import pg from "pg";

export default class DB {
    #dbClient = null;
    #dbHost = "";
    #dbPort = "";
    #dbName = "";
    #dbLogin = "";
    #dbPassword = "";

    constructor() {
        this.#dbHost = process.env.DB_HOST;
        this.#dbPort = process.env.DB_PORT;
        this.#dbName = process.env.DB_NAME;
        this.#dbLogin = process.env.DB_LOGIN;
        this.#dbPassword = process.env.DB_PASSWORD;

        this.#dbClient = new pg.Client({
            user: this.#dbLogin,
            database: this.#dbName,
            password: this.#dbPassword,
            host: this.#dbHost,
            port: this.#dbPort,
        });
    }
    // '*task*' === '*request*'
    //TODO: if delete worker, delete and it's testings
    async connect() {
        try {
            await this.#dbClient.connect();
            console.log("DB connected");
        } catch (error) {
            console.error(error);
            return Promise.reject(error);
        }
    }
    async disconnect() {
        await this.#dbClient.end();
        console.log("DB Disconnected");
    }
    async getWorkers() {
        try {
            const res = await this.#dbClient.query(
                "SELECT * FROM WORKERS ORDER BY FIO;"
            );
            return res.rows;
        } catch (error) {
            console.log("Unable to getWorkers().");
            return Promise.reject(error);
        }
    }
    async getRequests() {
        try {
            const res = await this.#dbClient.query(
                "SELECT * FROM REQUESTS ORDER BY DATE_START;"
            );
            return res.rows;
        } catch (error) {
            console.log("Unable to getRequests().");
            return Promise.reject(error);
        }
    }
    async createWorker({ id = null, fio = "" }) {
        if (!fio || !id)
            throw {
                type: "client",
                error: new Error(
                    `createWorker() wrong params (${Object.entries({ fio, id })
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(",")})`
                ),
            };
        try {
            await this.#dbClient.query(
                "INSERT INTO WORKERS (id, FIO) VALUES ($1, $2);",
                [id, fio]
            );
        } catch (error) {
            console.log("Unable to createWorker().");
            return Promise.reject(error);
        }
    }
    async deleteWorker({ id = null }) {
        if (!id)
            throw {
                type: "client",
                error: new Error(
                    `deleteWorker() wrong params (${Object.entries({ id })
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(",")})`
                ),
            };
        try {
            const tasks = await this.#dbClient.oneOrNone(
                "SELECT TASKS FROM WORKER WHERE id = $1",
                [id]
            );
            await this.#dbClient.query("DELETE FROM WORKERS WHERE ID = $1;", [
                id,
            ]);
            // Update each requests' worker_id to null
            if (tasks && tasks.TASKS)
                for (const task of tasks.TASKS)
                    await this.#dbClient.query(
                        "UPDATE REQUESTS SET WORKER_ID = null WHERE ID = $1",
                        [task.ID]
                    );
        } catch (error) {
            console.log("Unable to deleteWorker().");
            return Promise.reject(error);
        }
    }
    async updateWorker({ id = null, fio = "" }) {
        if (!fio || !id) {
            throw {
                type: "client",
                error: new Error(
                    `updateWorker() wrong params (${Object.entries({ fio, id })
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(",")})`
                ),
            };
        }
        try {
            await this.#dbClient.query(
                "UPDATE WORKERS SET FIO = $1 WHERE ID = $2;",
                [fio, id]
            );
        } catch (error) {
            console.log("Unable to updateWorker().");
            return Promise.reject(error);
        }
    }
    async assignTask({ workerId = null, taskId = null }) {
        if (!taskId || !workerId)
            throw {
                type: "client",
                error: new Error(
                    `assignTask() wrong params (${Object.entries({
                        task_id: taskId,
                        workerId,
                    })
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(",")})`
                ),
            };
        try {
            if (this.checkDateOverlap())
                throw new Error("Date overlap detected. Cannot assignTask.");

            await this.#dbClient.query(
                "UPDATE WORKER SET TASKS = ARRAY_APPEND(TASKS, $1) WHERE ID = $2;",
                [taskId, workerId]
            );
            await this.#dbClient.query(
                "UPDATE REQUESTS SET WORKER_ID= $2 WHERE ID =$1;",
                [taskId, workerId]
            );
        } catch (error) {
            console.log("Unable to assignTask().");
            return Promise.reject(error);
        }
    }
    async unassignTask({ id = null, taskId = null }) {
        if (!taskId || !id) {
            throw {
                type: "client",
                error: new Error(
                    `unassignTask() wrong params (${Object.entries({
                        task_id: taskId,
                        id,
                    })
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(",")})`
                ),
            };
        }
        try {
            await this.#dbClient.query(
                "UPDATE WORKER SET TASKS = ARRAY_REMOVE(TASKS, $1) WHERE ID = $2;",
                [taskId, id]
            );
            await this.#dbClient.query(
                "UPDATE REQUESTS SET WORKER_ID=NULL WHERE ID =$1;",
                [taskId]
            );
        } catch (error) {
            console.log("Unable to unassignTask().");
            return Promise.reject(error);
        }
    }
    async reassignTask({
        task_id = null,
        src_worker_id = null,
        dest_wordker_id = null,
    }) {
        try {
            await this.unassignTask({ id: src_worker_id, task_id });
            await this.assignTask({ id: dest_wordker_id, task_id });
        } catch (error) {
            console.log("Unable to reassignTask().");
            return Promise.reject(error);
        }
    }
    async createTask({ ID, DATE_START, DATE_END, EQUIPMENT_ID, WORKER_ID }) {}

    async updateTask({
        id = null,
        dateStart = null,
        dateEnd = null,
        equipmentId = null,
        workerId = null,
    }) {
        // HAVE to check if this worker doesnt have any tests in this perioud
        if (!id || (!dateStart && !dateEnd && !equipmentId && !workerId)) {
            throw {
                type: "client",
                error: new Error(
                    `updateTask() wrong params (${Object.entries({
                        dateStart,
                        dateEnd,
                        equipmentId,
                        workerId,
                        id,
                    })
                        .map(([key, value]) => `${key}: ${value}`)
                        .join(",")})`
                ),
            };
        }
        const params = [dateStart, dateEnd, equipmentId, workerId, id];
        let query = "UPDATE REQUESTS SET";

        // Build the SET clause for the SQL query
        const updateFields = {
            DATE_START: dateStart,
            DATE_END: dateEnd,
            EQUIPMENT_ID: equipmentId,
            WORKER_ID: workerId,
        };

        let flag = false;
        let dateChangedFlag = false;

        for (let i = 0; i < params.length - 1; i++) {
            if (params[i]) {
                if (flag) query += ",";
                query += ` ${Object.keys(updateFields)[i]} = $${i + 1}`;
                flag = true;
            }
            if (Object.keys(updateFields)[i].includes("DATE"))
                dateChangedFlag = true;
        }
        query += ` WHERE ID = $5;`;

        try {
            if (
                dateChangedFlag &&
                this.checkDateOverlap(id, dateStart, dateEnd, updateFields[3])
            )
                throw new Error("Date overlap detected. Cannot updateTask.");

            await this.#dbClient.query(query, params);
        } catch (error) {
            console.log("Unable to updateTask().");
            return Promise.reject(error);
        }
    }
    async checkDateOverlap(id, newDateStart, newDateEnd, rawWorkerId) {
        try {
            // check if worker isn't occupied in the period [newDateStart,newDateEnd]
            const workerId = !rawWorkerId
                ? await this.#dbClient.oneOrNone(
                      "SELECT ID FROM WORKER WHERE $1 = ANY(TASKS)",
                      [id]
                  )
                : rawWorkerId;
            const result = await this.#dbClient.query(
                "SELECT COUNT(*) FROM REQUESTS WHERE WORKER_ID = $1 AND (($2 >= DATE_START AND $2 <= DATE_END) OR ($3 >= DATE_START AND $3 <= DATE_END))",
                [workerId.id, newDateStart, newDateEnd]
            );
            const overlapCount = parseInt(result.rows[0].count);

            return overlapCount > 0;
        } catch (error) {
            console.error("Error checking date overlap:", error);
            throw error;
        }
    }
    async checkEquipmentAvailability(id) {
        try {
            const result = await this.#dbClient.query(
                `SELECT AVAILABLE
                FROM EQUIPMENT
                WHERE ID = $1`,
                [id]
            );

            // Check if the equipment is available for the specified period
            const availableQuantity = result.rows[0]?.available || 0;

            return availableQuantity >= 1;
        } catch (error) {
            console.log("Error checking equipment availability:", error);
            throw error;
        }
    }
    // TODO: add createTask()
    // TODO: review checkEquipmentAvailability() usage
}
