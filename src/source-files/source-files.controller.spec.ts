import { Test, TestingModule } from '@nestjs/testing';
import { SourceFilesController } from './source-files.controller';
import { PrismaService } from '../prisma/prisma.service';

describe('SourceFilesController', () => {
  let controller: SourceFilesController;

  beforeEach(async () => {
    // @ts-ignore
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: PrismaService,
          useFactory() {
            return {};
          },
        },
      ],
      controllers: [SourceFilesController],
    }).compile();

    controller = module.get<SourceFilesController>(SourceFilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
