import { Test, TestingModule } from '@nestjs/testing';
import { DataPrepService } from './data-prep.service';

describe('DataPrepService', () => {
  let service: DataPrepService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DataPrepService],
    }).compile();

    service = module.get<DataPrepService>(DataPrepService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
