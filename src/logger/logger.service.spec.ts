import { Test, TestingModule } from '@nestjs/testing';
import { LoggerProvider } from './logger.service';

describe('LoggerService', () => {
  let service: LoggerProvider;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LoggerProvider],
    }).compile();

    service = module.get<LoggerProvider>(LoggerProvider);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
