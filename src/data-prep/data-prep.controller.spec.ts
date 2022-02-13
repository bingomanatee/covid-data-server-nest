import { Test, TestingModule } from '@nestjs/testing';
import { DataPrepController } from './data-prep.controller';

describe('DataPrepController', () => {
  let controller: DataPrepController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DataPrepController],
    }).compile();

    controller = module.get<DataPrepController>(DataPrepController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
