import { Test, TestingModule } from '@nestjs/testing';
import { CsvS3Service } from './csv-s3.service';
import { LoggingService } from '../../logging/logging.service';

describe('CsvS3Service', () => {
  let service: CsvS3Service;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: 'bucket',
          useFactory() {
            return 'foo';
          },
        },
        {
          provide: 's3Instance',
          useFactory() {
            return {};
          },
        },
        {
          provide: LoggingService,
          useFactory() {
            return {};
          },
        },
        CsvS3Service,
      ],
    }).compile();

    service = module.get<CsvS3Service>(CsvS3Service);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
