import { Test, TestingModule } from '@nestjs/testing';
import { DailyCasesController } from './daily-cases.controller';

describe('DailyCasesController', () => {
  let controller: DailyCasesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DailyCasesController],
    }).compile();

    controller = module.get<DailyCasesController>(DailyCasesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
