import { Test, TestingModule } from '@nestjs/testing';
import { GithubCsvService } from './github-csv.service';

describe('GithubCsvService', () => {
  let service: GithubCsvService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [GithubCsvService],
    }).compile();

    service = module.get<GithubCsvService>(GithubCsvService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
