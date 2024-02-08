import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class EquipmentService {
  constructor(private readonly databaseService: DatabaseService) {}

  async findAll() {
    try {
      return await this.databaseService.getEquipment();
    } catch (error) {
      console.error('Error retrieving equipment:', error);
      throw new Error(error);
    }
  }
}
