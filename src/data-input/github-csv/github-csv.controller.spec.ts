import { Test, TestingModule } from '@nestjs/testing';
import { GithubCsvController } from './github-csv.controller';

describe('GithubCsvController', () => {
  let controller: GithubCsvController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GithubCsvController],
    }).compile();

    controller = module.get<GithubCsvController>(GithubCsvController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
