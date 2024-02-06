import { Module, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Module({
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule implements OnModuleInit, OnModuleDestroy {
  constructor(private readonly databaseService: DatabaseService) {}
  async onModuleInit() {
    try {
      await this.databaseService.connect();
    } catch (error) {
      console.error(error);
    }
  }
  async onModuleDestroy() {
    try {
      await this.databaseService.disconnect();
    } catch (error) {
      console.error(error);
    }
  }
}
