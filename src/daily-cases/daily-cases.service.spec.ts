import { Test, TestingModule } from '@nestjs/testing';
import { DailyCasesService } from './daily-cases.service';

describe('DailyCasesService', () => {
  let service: DailyCasesService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DailyCasesService],
    }).compile();

    service = module.get<DailyCasesService>(DailyCasesService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
