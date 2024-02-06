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
import { WorkersService } from './workers.service';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';

@Controller('workers')
export class WorkersController {
  constructor(private readonly workersService: WorkersService) {}

  @Post()
  async create(@Body() { id, fio }: { id: string; fio: string }) {
    try {
      return await this.workersService.create({ id, fio });
    } catch (error) {
      return error.response;
    }
  }

  @Get()
  async findAll() {
    try {
      return await this.workersService.findAll();
    } catch (error) {
      return error.response;
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      return await this.workersService.findOne(id);
    } catch (error) {
      return error.response;
    }
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body('fio') fio: string) {
    try {
      return await this.workersService.update(id, fio);
    } catch (error) {
      return error.response;
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      return await this.workersService.remove(id);
    } catch (error) {
      return error.response;
    }
  }
}
