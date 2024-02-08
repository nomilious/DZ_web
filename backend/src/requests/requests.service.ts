import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
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
      throw new Error(error);
    }
  }

  async findAll() {
    try {
      return await this.databaseService.getRequests();
    } catch (error) {
      console.error('Error retrieving requests:', error);
      throw new Error(error);
    }
  }
  // TODO  pass workerId tooo
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
      throw new Error(error);
    }
  }

  async remove(id: string) {
    try {
      const request = await this.databaseService.getRequestById({ id });
      if (!request || !request.length) return;

      const workerId = request[0].worker_id;
      // remove from worker's tasks this request
      await this.databaseService.unassingRequest({ id, workerId });

      return await this.databaseService.deleteRequest({ id });
    } catch (error) {
      console.error('Error removing requests:', error);
      throw new Error(error);
    }
  }
}
