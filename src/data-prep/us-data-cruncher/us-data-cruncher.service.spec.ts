import { Test, TestingModule } from '@nestjs/testing';
import { UsDataCruncherService } from './us-data-cruncher.service';
import { PrismaService } from '../../prisma/prisma.service';
import { CsvS3Service } from '../../data-input/csv-s3/csv-s3.service';
import { S3ToDatabaseService } from '../../data-input/s3-to-database/s3-to-database.service';
import { LoggingService } from '../../logging/logging.service';

describe('UsDataCruncherService', () => {
  let service: UsDataCruncherService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
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
        {
          provide: LoggingService,
          useFactory: () => {
            return {};
          },
        },
        {
          provide: CsvS3Service,
          useFactory: () => {
            return {};
          },
        },
        UsDataCruncherService,
      ],
    }).compile();

    service = module.get<UsDataCruncherService>(UsDataCruncherService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
