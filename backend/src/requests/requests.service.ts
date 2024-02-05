import { Injectable } from '@nestjs/common';
import { CreateRequestDto } from './dto/create-request.dto';
import { UpdateRequestDto } from './dto/update-request.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class RequestsService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createRequestDto: CreateRequestDto) {
    return 'This action adds a new request';
  }

  async findAll() {
    return await this.databaseService.getRequests();
  }

  findOne(id: number) {
    return `This action returns a #${id} request`;
  }

  update(id: number, updateRequestDto: UpdateRequestDto) {
    return `This action updates a #${id} request`;
  }

  remove(id: number) {
    return `This action removes a #${id} request`;
  }
}
