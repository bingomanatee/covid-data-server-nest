import { Test, TestingModule } from '@nestjs/testing';
import { DataPrepService } from './data-prep.service';
import { PrismaService } from '../prisma/prisma.service';
import { LoggingService } from '../logging/logging.service';
describe('DataPrepService', () => {
  let service: DataPrepService;

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
          provide: LoggingService,
          useFactory: () => {
            return {};
          },
        },
        DataPrepService,
      ],
    }).compile();

    service = module.get<DataPrepService>(DataPrepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
