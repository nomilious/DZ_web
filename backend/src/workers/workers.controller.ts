import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
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

  @Get('all')
  async findAll2() {
    try {
      return await this.workersService.findAll2();
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
  @Patch('move/:id')
  async moveTask(
    @Param('id') id: string,
    @Body() body: { srcWorkerId: string; destWorkerId: string },
  ) {
    try {
      return await this.workersService.moveTask(id, body);
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
