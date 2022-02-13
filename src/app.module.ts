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
import { DailyCasesController } from './daily-cases/daily-cases.controller';
import { CsvS3Service } from './data-input/csv-s3/csv-s3.service';
import { S3ToDatabaseService } from './data-input/s3-to-database/s3-to-database.service';
import { DataPrepService } from './data-prep/data-prep.service';
import { DataPrepController } from './data-prep/data-prep.controller';
import { DataPrepModule } from './data-prep/data-prep.module';

@Module({
  imports: [
    DataInputModule,
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '../..', 'frontend/dist'),
    }),
    ScheduleModule.forRoot(),
    DataPrepModule,
  ],
  controllers: [
    SourceFilesController,
    DailyCasesController,
    DataPrepController,
  ],
  providers: [
    AppService,
    DailyCasesService,
    PrismaService,
    LoggerProvider,
    LoggingService,
    CsvS3Service,
    S3ToDatabaseService,
    DataPrepService,
    {
      provide: 'bucket',
      useValue: 'covid-csv-storage',
    },
  ],
})
export class AppModule {}
