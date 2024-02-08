import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpStatus,
  HttpException,
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
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error creating requests: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.requestsService.findAll();
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
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error updating requests: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.requestsService.remove(id);
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error removing requests: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
