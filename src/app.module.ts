import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DailyCasesService } from './daily-cases/daily-cases.service';
import { PrismaService } from './prisma/prisma.service';
import { DataInputModule } from './data-input/data-input.module';
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';
import { SourceFilesController } from './source-files/source-files.controller';
import { ScheduleModule } from '@nestjs/schedule';
import { LoggerProvider } from './logger/logger.service';
import { LoggingService } from './logging/logging.service';

@Module({
  imports: [
    DataInputModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'frontend/dist'),
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [SourceFilesController],
  providers: [AppService, DailyCasesService, PrismaService, LoggerProvider, LoggingService],
})
export class AppModule {}
