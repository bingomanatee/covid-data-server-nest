import { Inject, Get, Controller } from '@nestjs/common';
import { CsvS3Service } from './../data-input/csv-s3/csv-s3.service';
import { PrismaService } from './../prisma/prisma.service';
import { LoggingService } from './../logging/logging.service';
import { S3ToDatabaseService } from './../data-input/s3-to-database/s3-to-database.service';
@Controller('api')
export class DailyCasesController {
  private s3Service: any;
  private prismaService: any;
  private loggingService: any;
  private s3ToDBservice: any;

  _loading: any;

  constructor(
    @Inject(CsvS3Service) s3Service,
    @Inject(PrismaService) prismaService,
    @Inject(LoggingService) loggingService,
    @Inject(S3ToDatabaseService) s3ToDBservice,
  ) {
    this.s3Service = s3Service;
    this.prismaService = prismaService;
    this.loggingService = loggingService;
    this.s3ToDBservice = s3ToDBservice;
  }

  @Get('locations')
  async getLocations() {
    return this.s3ToDBservice.getUniqueLocations();
  }
}
