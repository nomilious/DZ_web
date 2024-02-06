import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WorkersService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(body: { id: string; fio: string }) {
    try {
      return await this.databaseService.createWorker({ ...body });
    } catch (error) {
      console.error('Error creating worker:', error);
      return Promise.reject(error);
    }
  }

  async findAll() {
    try {
      const [rawEquipment, reaWorkers, rawRequests] = await Promise.all([
        this.databaseService.getEquipment(),
        this.databaseService.getWorkers(),
        this.databaseService.getRequests(),
      ]);

      // TRANSFORM RAW REQUEST
      // Date is transformed to locale date
      const requests = rawRequests.map((request) => ({
        id: request.id,
        dateStart: request.date_start.toLocaleDateString('ru-Ru'),
        dateEnd: request.date_end.toLocaleDateString('ru-Ru'),
        equipment: rawEquipment.filter(
          (equipment) => request.equipment_id === equipment.id,
        )[0],
      }));
      // TRANSFORM RAW workers
      return reaWorkers.map((worker) => ({
        id: worker.id,
        name: worker.fio,
        requests: requests.filter((req) => worker.tasks.indexOf(req.id) !== -1),
      }));
    } catch (error) {
      console.error('Error retrieving workers:', error);
      return Promise.reject(error);
    }
  }
  async findAll2() {
    try {
      return await this.databaseService.getWorkers();
    } catch (error) {
      console.error('Error getting One worker:', error);
      return Promise.reject(error);
    }
  }

  async findOne(id: string) {
    try {
      return await this.databaseService.getWorkerById({ id });
    } catch (error) {
      console.error('Error getting One worker:', error);
      return Promise.reject(error);
    }
  }

  async update(id: string, fio: string) {
    try {
      await this.databaseService.updateWorker({ id, fio });
    } catch (error) {
      console.error('Error updating worker:', error);
      return Promise.reject(error);
    }
  }

  // TODO maybe to return this await
  async remove(id: string) {
    try {
      const worker = await this.databaseService.getWorkerById({ id });

      // delete worker's requests
      for (const reqId of worker[0].tasks) {
        await this.databaseService.deleteRequest({ id: reqId });
      }
      await this.databaseService.deleteWorker({ id });
    } catch (error) {
      console.error('Error removing worker:', error);
      return Promise.reject(error);
    }
  }
}
