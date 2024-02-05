import { Injectable } from '@nestjs/common';
import { Client } from 'pg';

@Injectable()
export class DatabaseService {
  private dbClient: Client;

  constructor() {
    this.dbClient = new Client({
      user: process.env.DB_LOGIN,
      database: process.env.DB_NAME,
      password: process.env.DB_PASSWORD,
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
    });
  }
  async connect() {
    try {
      await this.dbClient.connect();
      console.log('DB connected');
    } catch (error) {
      console.error(error);
      throw error;
    }
  }
  async disconnect() {
    await this.dbClient.end();
    console.log('DB Disconnected');
  }
  async getWorkers() {
    try {
      const res = await this.dbClient.query(
        'SELECT * FROM WORKER ORDER BY FIO;',
      );
      return res.rows;
    } catch (error) {
      console.log('Unable to getWorkers().');
      return Promise.reject(error);
    }
  }
  async getEquipment() {
    try {
      const res = await this.dbClient.query('SELECT * FROM Equipment;');
      return res.rows;
    } catch (error) {
      console.log('Unable to getEquipment().');
      return Promise.reject(error);
    }
  }
  async getRequests() {
    try {
      const res = await this.dbClient.query(
        'SELECT * FROM REQUESTS ORDER BY DATE_START;',
      );
      return res.rows;
    } catch (error) {
      console.log('Unable to getRequests().');
      return Promise.reject(error);
    }
  }
  async createWorker({ id, fio }: { id: string; fio: string }): Promise<void> {
    try {
      if (!fio || !id) {
        throw {
          type: 'client',
          error: new Error(
            `createWorker() wrong params (id: ${id}, fio: ${fio})\``,
          ),
        };
      }

      await this.dbClient.query(
        'INSERT INTO WORKER (id, FIO) VALUES ($1, $2);',
        [id, fio],
      );
    } catch (error) {
      console.log('Unable to createWorker().', error);
      throw error;
    }
  }
  async deleteWorker({ id }: { id: string }): Promise<void> {
    try {
      if (!id) {
        throw {
          type: 'client',
          error: new Error(`deleteWorker() wrong params (id: ${id})`),
        };
      }

      const tasks = await this.dbClient.query(
        'SELECT TASKS FROM WORKER WHERE id = $1',
        [id],
      );

      if (!tasks || !tasks.rows || tasks.rows.length === 0) {
        throw new Error(`Worker with ID ${id} not found`);
      }

      await this.dbClient.query('DELETE FROM WORKER WHERE ID = $1;', [id]);

      // Update each request's worker_id to null
      for (const task of tasks.rows[0].TASKS) {
        await this.dbClient.query(
          'UPDATE REQUESTS SET WORKER_ID = null WHERE ID = $1',
          [task.ID],
        );
      }
    } catch (error) {
      console.log('Unable to deleteWorker().', error);
      throw error;
    }
  }
  async updateWorker({ id, fio }: { id: string; fio: string }): Promise<void> {
    try {
      if (!id || !fio) {
        throw {
          type: 'client',
          error: new Error(
            `updateWorker() wrong params (id: ${id}, fio: ${fio})`,
          ),
        };
      }

      const query = 'UPDATE WORKERS SET FIO = $1 WHERE ID = $2;';
      const values = [fio, id];

      await this.dbClient.query(query, values);
      console.log('Worker updated successfully');
    } catch (error) {
      console.log('Unable to updateWorker().', error);
      throw error;
    }
  }
  async assignTask({ workerId, taskId }: { workerId: string; taskId: string }) {
    try {
      if (!workerId || !taskId) {
        throw {
          type: 'client',
          error: new Error(
            `updateWorker() wrong params (workerId: ${workerId}, taskId: ${taskId})`,
          ),
        };
      }
      // if (await this.checkDateOverlap(taskId, workerId))
      //   throw new Error('Date overlap detected. Cannot assignTask.');

      await this.dbClient.query(
        'UPDATE WORKER SET TASKS = ARRAY_APPEND(TASKS, $1) WHERE ID = $2;',
        [taskId, workerId],
      );
      await this.dbClient.query(
        'UPDATE REQUESTS SET WORKER_ID= $2 WHERE ID =$1;',
        [taskId, workerId],
      );
    } catch (error) {
      console.log('Unable to assignTask().');
      return Promise.reject(error);
    }
  }
  async unassignTask({ id, taskId }: { id: string; taskId: string }) {
    try {
      if (!taskId || !id) {
        throw {
          type: 'client',
          error: new Error(
            `unassignTask() wrong params (id: ${id}, taskId: ${taskId})`,
          ),
        };
      }
      await this.dbClient.query(
        'UPDATE WORKER SET TASKS = ARRAY_REMOVE(TASKS, $1) WHERE ID = $2;',
        [taskId, id],
      );
      await this.dbClient.query(
        'UPDATE REQUESTS SET WORKER_ID=NULL WHERE ID =$1;',
        [taskId],
      );
    } catch (error) {
      console.log('Unable to unassignTask().');
      return Promise.reject(error);
    }
  }
  async reassignTask({
    taskId,
    src_worker_id,
    dest_worker_id,
  }: {
    taskId: string;
    src_worker_id: string;
    dest_worker_id: string;
  }) {
    try {
      await this.unassignTask({ id: src_worker_id, taskId });
      await this.assignTask({ workerId: dest_worker_id, taskId });
    } catch (error) {
      console.log('Unable to reassignTask().');
      return Promise.reject(error);
    }
  }
  async createTask({
    id,
    dateStart,
    dateEnd,
    equipmentId,
    workerId,
  }: {
    id: string;
    dateStart: Date;
    dateEnd: Date;
    equipmentId: string;
    workerId: string;
  }) {
    try {
      if (!id || !dateStart || !dateEnd || !equipmentId || !workerId) {
        throw {
          type: 'client',
          error: new Error(
            `createTask() wrong params (id: ${id}, dateStart: ${dateStart}, dateEnd: ${dateEnd}, equipmentId: ${equipmentId}, workerId: ${workerId})`,
          ),
        };
      }
      // if (!(await this.checkEquipmentAvailability(equipmentId)))
      //   throw new Error(
      //     'Lack of equipment for requests detected. Cannot createTask.',
      //   );

      await this.dbClient.query(
        'INSERT INTO REQUESTS(ID, DATE_START, DATE_END, EQUIPMENT_ID) VALUES ($1,$2,$3,$4);',
        [id, dateStart, dateEnd, equipmentId],
      );
      // TODO decrement quantity
      await this.assignTask({ workerId, taskId: id });
      //TODO if error => revert
    } catch (error) {
      console.log('Unable to createTask().');
      return Promise.reject(error);
    }
  }
  // it doesnt update workerId
  async updateTask({
    id,
    dateStart,
    dateEnd,
    equipmentId,
  }: {
    id: string;
    dateStart?: Date;
    dateEnd?: Date;
    equipmentId?: string;
  }) {
    // HAVE to check if this worker doesn't have any tests in this period
    try {
      if (!id || (!dateStart && !dateEnd && !equipmentId)) {
        throw {
          type: 'client',
          error: new Error(
            `updateTask() wrong params (id: ${id}, dateStart: ${dateStart}, dateEnd: ${dateEnd}, equipmentId: ${equipmentId})`,
          ),
        };
      }
    } catch (error) {
      return error;
    }
    const params = [dateStart, dateEnd, equipmentId, id];
    let query = 'UPDATE REQUESTS SET';

    // Build the SET clause for the SQL query
    const updateFields = {
      DATE_START: dateStart,
      DATE_END: dateEnd,
      EQUIPMENT_ID: equipmentId,
    };

    let flag = false;
    let dateChangedFlag = false;

    // if params[i] is set, then add it to string `query`
    for (let i = 0; i < params.length - 1; i++) {
      if (params[i]) {
        if (flag) query += ',';
        query += ` ${Object.keys(updateFields)[i]} = $${i + 1}`;
        flag = true;
      }
      if (Object.keys(updateFields)[i].includes('DATE')) dateChangedFlag = true;
    }
    query += ` WHERE ID = $4;`;

    try {
      if (
        dateChangedFlag &&
        (await this.checkDateOverlap(id, updateFields[3], dateStart, dateEnd))
      )
        throw new Error('Date overlap detected. Cannot updateTask.');

      await this.dbClient.query(query, params);
    } catch (error) {
      console.log('Unable to updateTask().');
      return Promise.reject(error);
    }
  }
  async checkDateOverlap(
    id: string,
    rawWorkerId: string,
    newDateStart: Date,
    newDateEnd: Date,
  ) {
    try {
      // check if worker isn't occupied in the period [newDateStart,newDateEnd]
      const workerId = !rawWorkerId
        ? await this.dbClient.query(
            'SELECT ID FROM WORKER WHERE $1 = ANY(TASKS)',
            [id],
          )
        : rawWorkerId;
      const result = await this.dbClient.query(
        'SELECT COUNT(*) FROM REQUESTS WHERE WORKER_ID = $1 AND (($2 >= DATE_START AND $2 <= DATE_END) OR ($3 >= DATE_START AND $3 <= DATE_END))',
        [workerId.id, newDateStart, newDateEnd],
      );

      const overlapCount = parseInt(result.rows[0].count);

      return overlapCount !== 0;
    } catch (error) {
      console.error('Error checking date overlap:', error);
      throw error;
    }
  }
  // async checkEquipmentAvailability(id) {
  //   try {
  //     const result = await this.dbClient.query(
  //       `SELECT AVAILABLE
  //               FROM EQUIPMENT
  //               WHERE ID = $1`,
  //       [id],
  //     );
  //
  //     // Check if the equipment is available for the specified period
  //     const availableQuantity = result.rows[0]?.available || 0;
  //
  //     return availableQuantity >= 1;
  //   } catch (error) {
  //     console.log('Error checking equipment availability:', error);
  //     throw error;
  //   }
  // }
  // TODO: review checkDateOverlap() usage
}
