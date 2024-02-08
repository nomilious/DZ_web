import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}
  @Get()
  async findAll() {
    try {
      return await this.equipmentService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error findAll requests: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
