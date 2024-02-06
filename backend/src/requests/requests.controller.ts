import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { RequestsService } from './requests.service';

@Controller('requests')
export class RequestsController {
  constructor(private readonly requestsService: RequestsService) {}

  @Post()
  async create(
    @Body()
    body: {
      id: string;
      startDate: Date;
      endDate: Date;
      equipmentId: string;
      workerId: string;
    },
  ) {
    try {
      return await this.requestsService.create(body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.requestsService.findAll();
    } catch (error) {
      return Promise.reject(error);
    }
  }
  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body()
    body: {
      startDate?: Date;
      endDate?: Date;
      equipmentId?: string;
    },
  ) {
    try {
      return await this.requestsService.update(id, body);
    } catch (error) {
      return Promise.reject(error);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.requestsService.remove(id);
    } catch (error) {
      return Promise.reject(error);
    }
  }
}
