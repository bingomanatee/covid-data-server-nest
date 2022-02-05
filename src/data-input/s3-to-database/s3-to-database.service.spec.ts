import { Test, TestingModule } from '@nestjs/testing';
import { S3ToDatabaseService } from './s3-to-database.service';

describe('S3ToDatabaseService', () => {
  let service: S3ToDatabaseService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [S3ToDatabaseService],
    }).compile();

    service = module.get<S3ToDatabaseService>(S3ToDatabaseService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
