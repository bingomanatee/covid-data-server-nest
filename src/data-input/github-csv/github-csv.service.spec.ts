import { Test, TestingModule } from '@nestjs/testing';
import { GithubCsvService } from './github-csv.service';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import { LoggingService } from '../../logging/logging.service';
import { PrismaService } from '../../prisma/prisma.service';
import { S3ToDatabaseService } from '../s3-to-database/s3-to-database.service';

describe('GithubCsvService', () => {
  let service: GithubCsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CsvS3Service,
          useFactory: () => {
            return {};
          },
        },
        {
          provide: LoggingService,
          useFactory: () => {
            return {};
          },
        },
        {
          provide: PrismaService,
          useFactory: () => {
            return {};
          },
        },
        {
          provide: S3ToDatabaseService,
          useFactory: () => {
            return {};
          },
        },
        GithubCsvService,
      ],
    }).compile();

    service = module.get<GithubCsvService>(GithubCsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
