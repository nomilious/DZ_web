import { Injectable } from '@nestjs/common';
import DB from './db/client.js';
@Injectable()
export class AppService {
  private readonly db = new DB();

  getHello(): string {
    return this.db.test();
  }
}
