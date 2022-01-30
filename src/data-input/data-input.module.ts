import { Module } from '@nestjs/common';
import { CsvS3Service } from './csv-s3/csv-s3.service';
import { GithubCsvService } from './github-csv/github-csv.service';
import { GithubCsvController } from './github-csv/github-csv.controller';
import { CsvS3Controller } from './csv-s3/csv-s3.controller';

@Module({
  providers: [
    CsvS3Service,
    GithubCsvService,
    {
      provide: 'bucket',
      useValue: 'covid-csv-storage',
    },
  ],
  controllers: [GithubCsvController, CsvS3Controller],
})
export class DataInputModule {}
