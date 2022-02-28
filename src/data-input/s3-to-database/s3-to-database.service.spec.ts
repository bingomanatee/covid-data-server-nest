import { Test, TestingModule } from '@nestjs/testing';
import { S3ToDatabaseService } from './s3-to-database.service';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import { PrismaService } from '../../prisma/prisma.service';
import { LoggingService } from '../../logging/logging.service';

describe('S3ToDatabaseService', () => {
  let service: S3ToDatabaseService;

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

        S3ToDatabaseService,
      ],
    }).compile();

    service = module.get<S3ToDatabaseService>(S3ToDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
