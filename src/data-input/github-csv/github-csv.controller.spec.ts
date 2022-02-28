import { Test, TestingModule } from '@nestjs/testing';
import { GithubCsvController } from './github-csv.controller';
import { GithubCsvService } from './github-csv.service';
import { LoggingService } from '../../logging/logging.service';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('GithubCsvController', () => {
  let controller: GithubCsvController;

  beforeEach(async () => {
    // @ts-ignore
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: GithubCsvService,
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
        {
          provide: CsvS3Service,
          useFactory: () => {
            return {};
          },
        },
      ],
      controllers: [GithubCsvController],
    }).compile();

    controller = module.get<GithubCsvController>(GithubCsvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
