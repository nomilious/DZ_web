import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RequestsService {
  constructor(private readonly databaseService: DatabaseService) {}

  async create(body: {
    id: string;
    startDate: Date;
    endDate: Date;
    equipmentId: string;
    workerId: string;
  }) {
    try {
      return await this.databaseService.createRequest({
        ...body,
      });
    } catch (error) {
      console.error('Error creating request:', error);
      return Promise.reject(error);
    }
  }

  async findAll() {
    try {
      return await this.databaseService.getRequests();
    } catch (error) {
      console.error('Error retrieving requests:', error);
      return Promise.reject(error);
    }
  }

  async update(
    id: string,
    body: {
      startDate?: Date;
      endDate?: Date;
      equipmentId?: string;
    },
  ) {
    try {
      return await this.databaseService.updateRequest({ id, ...body });
    } catch (error) {
      console.error('Error updating request:', error);
      return Promise.reject(error);
    }
  }

  async remove(id: string) {
    try {
      const request = await this.databaseService.getRequestById({ id });
      if (!request || !request.length) return;

      const workerId = request[0].worker_id;
      // remove from worker's tasks this request
      await this.databaseService.unassingRequest({ id: workerId, taskId: id });

      return await this.databaseService.deleteRequest({ id });
    } catch (error) {
      console.error('Error removing requests:', error);
      return Promise.reject(error);
    }
  }
}
