import { Inject, Injectable } from '@nestjs/common';
import { CsvS3Service } from '../../data-input/csv-s3/csv-s3.service';
import { PrismaService } from '../../prisma/prisma.service';
import { S3ToDatabaseService } from '../../data-input/s3-to-database/s3-to-database.service';
import { LoggingService } from '../../logging/logging.service';
import { makeCruncher } from './make-cruncher';

@Injectable()
export class UsDataCruncherService {
  private s3Service: any;
  private prismaService: any;
  private s3ToDB: any;
  private loggingService: any;
  private mirror: any;

  constructor(
    @Inject(CsvS3Service) s3Service,
    @Inject(PrismaService) prismaService,
    @Inject(S3ToDatabaseService) s3ToDB,
    @Inject(LoggingService) loggingService,
  ) {
    this.s3Service = s3Service;
    this.prismaService = prismaService;
    this.s3ToDB = s3ToDB;
    this.loggingService = loggingService;
    this.mirror = makeCruncher(this);
  }
}
