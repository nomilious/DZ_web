import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { WorkersService } from './workers.service';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  async create(@Body() body: { id: string; fio: string }) {
    try {
      return await this.workersService.create(body);
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error creating worker: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.workersService.findAll();
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error findAll worker: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('all')
  async findAll2() {
    try {
      return await this.workersService.findAll2();
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error findAll2 worker: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.workersService.findOne(id);
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error findOne worker: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body('fio') fio: string) {
    try {
      return await this.workersService.update(id, fio);
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error updating worker: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
  @Patch('move/:id')
  async moveTask(
    @Param('id') id: string,
    @Body() body: { srcWorkerId: string; destWorkerId: string },
  ) {
    try {
      return await this.workersService.moveTask(id, body);
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error moving worker: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.workersService.remove(id);
    } catch (error) {
      throw new HttpException(
        {
          timestamp: new Date().toISOString(),
          message: `Error remove worker: ${error.message}`,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
