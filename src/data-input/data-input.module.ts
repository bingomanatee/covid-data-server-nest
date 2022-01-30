import { Module } from '@nestjs/common';
import { CsvS3Service } from './csv-s3/csv-s3.service';
import { GithubCsvService } from './github-csv/github-csv.service';
import { GithubCsvController } from './github-csv/github-csv.controller';

@Module({
  providers: [
    CsvS3Service,
    GithubCsvService,
    {
      provide: 'bucket',
      useValue: 'covid-csv-storage',
    },
  ],
  controllers: [GithubCsvController],
})
export class DataInputModule {}
