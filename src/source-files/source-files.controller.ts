import { Controller, Get } from '@nestjs/common';
import { PrismaService } from './../prisma/prisma.service';

@Controller('api/source-files')
export class SourceFilesController {

  constructor(private prismaService: PrismaService) {}

  @Get()
  async findAll(): Promise<any> {
    return this.prismaService.source_files.findMany();
  }
}
