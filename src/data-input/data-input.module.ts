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
import { UsDataCruncherService } from '../data-prep/us-data-cruncher/us-data-cruncher.service';
import { S3Client as S3 } from '@aws-sdk/client-s3';

const bucketIdentity = {
  endpoint: 'https://s3.us-west-2.amazonaws.com',
  accessKeyId: process.env.AWS_BUCKET_ACCESS_KEY,
  secretAccessKey: process.env.AWS_BUCKET_SECRET,
  apiVersion: '2006-03-01',
  region: 'us-west-2',
};

@Module({
  providers: [
    CsvS3Service,
    GithubCsvService,
    DataPrepService,
    LoggingService,
    PrismaService,
    UsDataCruncherService,
    {
      provide: 's3Instance',
      useValue: new S3(bucketIdentity),
    },
    {
      provide: 'bucket',
      useValue: 'covid-csv-storage',
    },
    S3ToDatabaseService,
  ],
  controllers: [GithubCsvController, CsvS3Controller, DataPrepController],
})
export class DataInputModule {}
