import { Controller, Get } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}
  @Get()
  async findAll() {
    try {
      return await this.equipmentService.findAll();
    } catch (error) {
      console.error('Error retrieving equipment:', error);
      return Promise.reject(error);
    }
  }
}
