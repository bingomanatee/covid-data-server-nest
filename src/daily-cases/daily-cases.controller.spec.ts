import { Test, TestingModule } from '@nestjs/testing';
import { DailyCasesController } from './daily-cases.controller';
import { PrismaService } from '../prisma/prisma.service';
import { CsvS3Service } from '../data-input/csv-s3/csv-s3.service';
import { LoggingService } from '../logging/logging.service';
import { S3ToDatabaseService } from '../data-input/s3-to-database/s3-to-database.service';

describe('DailyCasesController', () => {
  let controller: DailyCasesController;

  beforeEach(async () => {
    // @ts-ignore
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
        {
          provide: S3ToDatabaseService,
          useFactory: () => {
            return {};
          },
        },
      ],
      controllers: [DailyCasesController],
    }).compile();

    controller = module.get<DailyCasesController>(DailyCasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
