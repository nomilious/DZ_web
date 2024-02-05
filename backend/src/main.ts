import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as dotenv from 'dotenv';

dotenv.config();

const app_host = process.env.APP_HOST;
const app_port = parseInt(process.env.APP_PORT, 10);

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(app_port);
}
bootstrap();
