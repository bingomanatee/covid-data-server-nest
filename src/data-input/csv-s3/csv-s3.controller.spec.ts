import { Test, TestingModule } from '@nestjs/testing';
import { CsvS3Controller } from './csv-s3.controller';
import { CsvS3Service } from './csv-s3.service';

describe('CsvS3Controller', () => {
  let controller: CsvS3Controller;

  beforeEach(async () => {
    // @ts-ignore
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: CsvS3Service,
          useFactory() {
            return {};
          },
        },
      ],
      controllers: [CsvS3Controller],
    }).compile();

    controller = module.get<CsvS3Controller>(CsvS3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
