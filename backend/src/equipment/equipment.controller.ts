import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  InternalServerErrorException,
} from '@nestjs/common';
import { EquipmentService } from './equipment.service';

@Controller('equipment')
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}
  @Get()
  async findAll() {
    // TODO maybe: add error types handling in catch
    try {
      return await this.equipmentService.findAll();
    } catch (error) {
      console.error('Error retrieving equipment:', error);
      throw new InternalServerErrorException('Error retrieving equipment');
    }
  }
}
