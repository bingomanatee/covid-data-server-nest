import { Test, TestingModule } from '@nestjs/testing';
import { CsvS3Controller } from './csv-s3.controller';

describe('CsvS3Controller', () => {
  let controller: CsvS3Controller;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CsvS3Controller],
    }).compile();

    controller = module.get<CsvS3Controller>(CsvS3Controller);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
