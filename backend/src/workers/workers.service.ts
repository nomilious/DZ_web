import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { CreateWorkerDto } from './dto/create-worker.dto';
import { UpdateWorkerDto } from './dto/update-worker.dto';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class WorkersService {
  constructor(private readonly databaseService: DatabaseService) {}

  create(createWorkerDto: CreateWorkerDto) {
    return 'This action adds a new worker';
  }

  async findAll() {
    try {
      const [rawEquipment, reaWorkers, rawRequests] = await Promise.all([
        this.databaseService.getEquipment(),
        this.databaseService.getWorkers(),
        this.databaseService.getRequests(),
      ]);

      // TRANSFORM RAW REQUEST
      const requests = rawRequests.map((request) => ({
        id: request.id,
        dateStart: request.date_start.toLocaleDateString('ru-Ru'),
        dateEnd: request.date_end.toLocaleDateString('ru-Ru'),
        equipment: rawEquipment.filter(
          (equipment) => request.equipment_id === equipment.id,
        )[0],
      }));
      // TRANSFORM RAW workers
      return reaWorkers.map((worker) => ({
        id: worker.id,
        name: worker.fio,
        requests: requests.filter((req) => worker.tasks.indexOf(req.id) !== -1),
      }));
    } catch (error) {
      console.error('Error retrieving workers:', error);
      throw new InternalServerErrorException('Error retrieving workers');
    }
  }

  findOne(id: number) {
    return `This action returns a #${id} worker`;
  }

  update(id: number, updateWorkerDto: UpdateWorkerDto) {
    return `This action updates a #${id} worker`;
  }

  remove(id: number) {
    /*
    TODO
    1. get Worker By Id
    2. via loop delete all he's requests
    3. delete worker
    4. something
    */
    return `This action removes a #${id} worker`;
  }
}
