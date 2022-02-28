import { Test, TestingModule } from '@nestjs/testing';
import { LoggingService } from '../logging/logging.service';
import { PrismaService } from '../prisma/prisma.service';
import { DataPrepController } from './data-prep.controller';
import { DataPrepService } from './data-prep.service';

describe('DataPrepController', () => {
  let controller: DataPrepController;

  beforeEach(async () => {
    // @ts-ignore
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: DataPrepService,
          useFactory() {
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
      ],
      controllers: [DataPrepController],
    }).compile();

    controller = module.get<DataPrepController>(DataPrepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
