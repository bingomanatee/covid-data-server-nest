import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { LoggerProvider } from './logger/logger.service';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}

bootstrap();
