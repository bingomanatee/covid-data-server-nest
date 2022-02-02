import { Test, TestingModule } from '@nestjs/testing';
import { SourceFilesController } from './source-files.controller';

describe('SourceFilesController', () => {
  let controller: SourceFilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SourceFilesController],
    }).compile();

    controller = module.get<SourceFilesController>(SourceFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
