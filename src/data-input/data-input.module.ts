import { Module } from '@nestjs/common';
import { CsvS3Service } from './csv-s3/csv-s3.service';
import { GithubCsvService } from './github-csv/github-csv.service';
import { GithubCsvController } from './github-csv/github-csv.controller';
import { CsvS3Controller } from './csv-s3/csv-s3.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3ToDatabaseService } from './s3-to-database/s3-to-database.service';
import { LoggingService } from './../logging/logging.service';
import { DataPrepService } from '../data-prep/data-prep.service';
import { DataPrepController } from '../data-prep/data-prep.controller';

@Module({
  providers: [
    CsvS3Service,
    GithubCsvService,
    DataPrepService,
    LoggingService,
    PrismaService,
    {
      provide: 'bucket',
      useValue: 'covid-csv-storage',
    },
    S3ToDatabaseService,
  ],
  controllers: [GithubCsvController, CsvS3Controller, DataPrepController],
})
export class DataInputModule {}
