import { Module } from '@nestjs/common';
import { CsvS3Service } from './csv-s3/csv-s3.service';
import { GithubCsvService } from './github-csv/github-csv.service';
import { GithubCsvController } from './github-csv/github-csv.controller';
import { CsvS3Controller } from './csv-s3/csv-s3.controller';
import { PrismaService } from '../prisma/prisma.service';
import { S3ToDatabaseService } from './s3-to-database/s3-to-database.service';
import CsvReadableStream from 'csv-reader';
import {LoggingService} from './../logging/logging.service';

@Module({
  providers: [
    CsvS3Service,
    GithubCsvService,
    PrismaService,
    LoggingService,
    {
      provide: 'bucket',
      useValue: 'covid-csv-storage',
    },
    S3ToDatabaseService,
  ],
  controllers: [GithubCsvController, CsvS3Controller],
})
export class DataInputModule {}
