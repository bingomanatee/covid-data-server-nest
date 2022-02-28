import { Controller, Get, Injectable, Inject } from '@nestjs/common';
import { CsvS3Service } from './csv-s3.service';

interface S3data {
  Key: string;
}

@Injectable()
@Controller('api/csv-s3')
export class CsvS3Controller {
  private csvS3service: any;
  constructor(@Inject(CsvS3Service) csvS3service: any) {}

  @Get()
  async findAll(): Promise<S3data[]> {
    return this.csvS3service.getBucketKeys();
  }
}
