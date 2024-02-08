import { Injectable } from '@nestjs/common';
import { Client } from 'pg';
const pg = require('pg');
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
    // disable Fucking timezones
    pg.types.setTypeParser(1114, function (stringValue) {
      return stringValue; //1114 for time without timezone type
    });

    pg.types.setTypeParser(1082, function (stringValue) {
      return stringValue; //1082 for date type
    });
  }
  async connect() {
    try {
      await this.dbClient.connect();
      console.log('DB connected');
    } catch (error) {
      throw new Error(error);
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
      throw new Error('Unable to getWorkers().' + error);
    }
  }
  async getEquipment() {
    try {
      const res = await this.dbClient.query('SELECT * FROM Equipment;');
      return res.rows;
    } catch (error) {
      console.log('Unable to getEquipment().');
      throw new Error('Unable to getEquipment().' + error);
    }
  }
  async getRequests() {
    try {
      const res = await this.dbClient.query(
        'SELECT * FROM REQUESTS ORDER BY DATE_START;',
      );
      return res.rows;
    } catch (error) {
      console.error(`Unable to getRequests(), ${error}`);
      throw new Error('Unable to getRequests().' + error);
    }
  }
  async getRequestById({ id }: { id: string }) {
    try {
      const res = await this.dbClient.query(
        'SELECT * FROM REQUESTS WHERE id = $1',
        [id],
      );
      return res.rows;
    } catch (error) {
      console.error(`Unable to getRequestById(), ${error}`);
      throw new Error('Unable to getRequestById().' + error);
    }
  }
  async getWorkerById({ id }: { id: string }) {
    try {
      const res = await this.dbClient.query(
        'SELECT * FROM WORKER WHERE id = $1',
        [id],
      );
      return res.rows;
    } catch (error) {
      console.error(`Unable to getWorkerById(), ${error}`);
      return Promise.reject({
        type: 'internal',
        error,
      });
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
      console.error(`Unable to createWorker(), ${error}`);
      throw new Error('Unable to createWorker().' + error);
    }
  }

  async deleteRequest({ id }: { id: string }): Promise<void> {
    try {
      if (!id) {
        throw {
          type: 'client',
          error: new Error(`deleteRequest() wrong params (id: ${id})`),
        };
      }
      const requests = await this.dbClient.query(
        'SELECT * FROM REQUESTS WHERE id = $1',
        [id],
      );

      if (!requests || !requests.rows || !requests.rows.length) {
        throw new Error(`Request with ID ${id} not found`);
      }

      const equipmentId = requests.rows[0].equipment_id;

      await this.dbClient.query('DELETE FROM REQUESTS WHERE ID = $1;', [id]);

      // increase available count
      await this.increaseEquipmentAvailable({ equipmentId });
    } catch (error) {
      console.error(`Unable to deleteRequest(), ${error}`);
      throw new Error('Unable to deleteRequest().' + error);
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
        'SELECT * FROM WORKER WHERE id = $1',
        [id],
      );

      if (!tasks || !tasks.rows || tasks.rows.length === 0) {
        throw new Error(`Worker with ID ${id} not found`);
      }

      await this.dbClient.query('DELETE FROM WORKER WHERE ID = $1;', [id]);
    } catch (error) {
      console.error(`Unable to deleteWorker(), ${error}`);
      throw new Error('Unable to deleteWorker().' + error);
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

      const query = 'UPDATE WORKER SET FIO = $1 WHERE ID = $2;';
      const values = [fio, id];

      await this.dbClient.query(query, values);
    } catch (error) {
      console.error(`Unable to updateWorker(), ${error}`);
      throw new Error('Unable to updateWorker().' + error);
    }
  }
  async assingRequest({ id, workerId }: { id: string; workerId: string }) {
    try {
      if (!workerId || !id) {
        throw {
          type: 'client',
          error: new Error(
            `updateWorker() wrong params (workerId: ${workerId}, taskId: ${workerId})`,
          ),
        };
      }
      // if (await this.checkDateOverlap(taskId, workerId))
      //   throw new Error('Date overlap detected. Cannot assingRequest.');

      await this.dbClient.query(
        'UPDATE WORKER SET TASKS = ARRAY_APPEND(TASKS, $1) WHERE ID = $2;',
        [id, workerId],
      );
      await this.dbClient.query(
        'UPDATE REQUESTS SET WORKER_ID= $2 WHERE ID =$1;',
        [id, workerId],
      );
    } catch (error) {
      console.log('Unable to assingRequest().');
      throw new Error('Unable to assingRequest().' + error);
    }
  }
  async unassingRequest({ id, workerId }: { id: string; workerId: string }) {
    try {
      if (!workerId || !id) {
        throw {
          type: 'client',
          error: new Error(
            `unassingRequest() wrong params (id: ${id}, taskId: ${workerId})`,
          ),
        };
      }
      await this.dbClient.query(
        'UPDATE WORKER SET TASKS = ARRAY_REMOVE(TASKS, $1) WHERE ID = $2;',
        [id, workerId],
      );
      await this.dbClient.query(
        'UPDATE REQUESTS SET WORKER_ID=NULL WHERE ID =$1;',
        [id],
      );
    } catch (error) {
      console.error(`Unable to unassingRequest(), ${error}`);
      throw new Error('Unable to unassingRequest().' + error);
    }
  }
  async reassingRequest({
    id,
    srcWorkerId,
    destWorkerId,
  }: {
    id: string;
    srcWorkerId: string;
    destWorkerId: string;
  }) {
    try {
      await this.unassingRequest({ id, workerId: srcWorkerId });
      await this.assingRequest({ workerId: destWorkerId, id });
    } catch (error) {
      console.error(`Unable to reassingRequest(), ${error}`);
      throw new Error('Unable to reassingRequest().' + error);
    }
  }
  async createRequest({
    id,
    startDate,
    endDate,
    equipmentId,
    workerId,
  }: {
    id: string;
    startDate: Date;
    endDate: Date;
    equipmentId: string;
    workerId: string;
  }) {
    try {
      if (!id || !startDate || !endDate || !equipmentId || !workerId) {
        throw {
          type: 'client',
          error: new Error(
            `createRequest() wrong params (id: ${id}, dateStart: ${startDate}, dateEnd: ${endDate}, equipmentId: ${equipmentId}, workerId: ${workerId})`,
          ),
        };
      }
      if (!this.checkDates({ dateStart: startDate, dateEnd: endDate })) {
        return Promise.reject(`Dates are bad, Got ${startDate} ${endDate}`);
      }

      if (!(await this.checkEquipmentAvailability(equipmentId)))
        return Promise.reject(
          'Lack of equipment for requests detected. Cannot createRequest.',
        );
      if (!(await this.checkDateOverlap(id, equipmentId, startDate, endDate))) {
        return Promise.reject(
          `Date overlap detected. Cannot createRequest. ${startDate}, ${endDate}`,
        );
      }
      await this.dbClient.query(
        'INSERT INTO REQUESTS(ID, DATE_START, DATE_END, EQUIPMENT_ID) VALUES ($1,$2,$3,$4);',
        [id, startDate, endDate, equipmentId],
      );

      await this.decreaseEquipmentAvailable({ equipmentId });

      await this.assingRequest({ workerId, id });
    } catch (error) {
      console.error(`Unable to createRequest(), ${error}`);
      throw new Error('Unable to createRequest().' + error);
    }
  }
  // if workerId is passed and not null => run reasignTasks
  async updateRequest({
    id,
    startDate,
    endDate,
    equipmentId,
  }: {
    id: string;
    startDate?: Date;
    endDate?: Date;
    equipmentId?: string;
  }) {
    // HAVE to check if this worker doesn't have any tests in this period
    try {
      if (!id || (!startDate && !endDate && !equipmentId)) {
        throw {
          type: 'client',
          error: new Error(
            `updateRequest() wrong params (id: ${id}, dateStart: ${startDate}, dateEnd: ${endDate}, equipmentId: ${equipmentId})`,
          ),
        };
      }
    } catch (error) {
      throw new Error(error);
    }
    const params = [startDate, endDate, equipmentId, id].filter(
      (param) => param !== undefined,
    );
    let query = 'UPDATE REQUESTS SET';

    // Build the SET clause for the SQL query
    const updateFields = {
      DATE_START: startDate,
      DATE_END: endDate,
      EQUIPMENT_ID: equipmentId,
    };

    let commaFlag = false;
    let dateChangedFlag = startDate || endDate;
    let equipmentChangedFlag = equipmentId !== undefined;

    // if params[i] is set, then add it to string `query`
    for (let i = 0; i < params.length - 1; i++) {
      if (params[i]) {
        if (commaFlag) query += ',';

        query += ` ${Object.keys(updateFields)[i]} = $${i + 1}`;
        commaFlag = true;
      }
    }
    query += ` WHERE ID = $${params.length};`;

    if (!this.checkDates({ dateStart: startDate, dateEnd: endDate })) {
      return Promise.reject(
        `Date overlap detected. Cannot createRequest. ${startDate}, ${endDate}`,
      );
    }

    try {
      if (equipmentChangedFlag) {
        if (!(await this.checkEquipmentAvailability(equipmentId))) {
          throw new Error(
            'New equipment have no available instances. Cannot updateRequest.',
          );
        }
      }
      if (dateChangedFlag) {
        if (
          !(await this.checkDateOverlap(id, equipmentId, startDate, endDate))
        ) {
          throw new Error('Date overlap detected. Cannot updateRequest.');
        }
      }

      await this.dbClient.query(query, params);
    } catch (error) {
      throw new Error('Unable to updateRequest().' + error);
    }
  }
  async decreaseEquipmentAvailable({ equipmentId }: { equipmentId: string }) {
    try {
      if (!equipmentId) {
        throw {
          type: 'client',
          error: new Error(
            `decreaseEquipmentAvailable() wrong params (id: ${equipmentId}`,
          ),
        };
      }
      await this.dbClient.query(
        'UPDATE EQUIPMENT SET available = available -1 WHERE ID=$1',
        [equipmentId],
      );
    } catch (error) {
      throw new Error('Unable to decreaseEquipmentAvailable().' + error);
    }
  }
  async increaseEquipmentAvailable({ equipmentId }: { equipmentId: string }) {
    try {
      if (!equipmentId) {
        throw {
          type: 'client',
          error: new Error(
            `decreaseEquipmentAvailable() wrong params (id: ${equipmentId}`,
          ),
        };
      }
      await this.dbClient.query(
        'UPDATE EQUIPMENT SET available = available + 1 WHERE ID=$1',
        [equipmentId],
      );
    } catch (error) {
      throw new Error('Unable to increaseEquipmentAvailable().' + error);
    }
  }
  async checkDateOverlap(
    reqId: string,
    equipmentId: string,
    startDate: Date,
    endDate: Date,
  ) {
    // count all requests excepting reqId
    // where date overlaps(dateStart between dates or endDate between Dates)
    const query = `
        SELECT COUNT(*) AS count
        FROM REQUESTS 
        WHERE id !=$1 and equipment_id =$2
        AND (
            ($3 BETWEEN DATE_START AND DATE_END) OR 
            ($4 BETWEEN DATE_START AND DATE_END) OR
            ($3 < DATE_START AND $4 > DATE_END )
        );`;

    try {
      const request = await this.dbClient.query(
        `Select * from REQUESTS where id = $1`,
        [reqId],
      );
      // if (!request)

      if (!equipmentId) {
        equipmentId = request.rows[0].equipment_id;
      }
      if (!startDate) {
        startDate = request.rows[0].date_start;
      }
      if (!endDate) {
        endDate = request.rows[0].date_end;
      }
      const result = await this.dbClient.query(query, [
        reqId,
        equipmentId,
        startDate,
        endDate,
      ]);

      const overlapCount = parseInt(result.rows[0].count);

      return overlapCount === 0;
    } catch (error) {
      throw new Error('Unable to checkDateOverlap().' + error);
    }
  }

  checkDates({ dateStart, dateEnd }: { dateStart: Date; dateEnd: Date }) {
    return dateStart <= dateEnd;
  }

  async checkEquipmentAvailability(id: string) {
    try {
      const result = await this.dbClient.query(
        `SELECT AVAILABLE
                FROM EQUIPMENT
                WHERE ID = $1`,
        [id],
      );

      // Check if the equipment is available for the specified period
      const availableQuantity = result.rows[0]?.available || 0;

      return availableQuantity >= 1;
    } catch (error) {
      throw new Error('Unable to checkEquipmentAvailability().' + error);
    }
  }
}
