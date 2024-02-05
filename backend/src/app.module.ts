import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WorkersModule } from './workers/workers.module';
import { RequestsModule } from './requests/requests.module';
import { DatabaseModule } from './database/database.module';
import { EquipmentModule } from './equipment/equipment.module';

@Module({
  imports: [WorkersModule, RequestsModule, DatabaseModule, EquipmentModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
