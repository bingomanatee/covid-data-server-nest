import { Module } from '@nestjs/common';
import { LoggingService } from './../logging/logging.service';
import { DataPrepService } from './data-prep.service';
import { DataPrepController } from './data-prep.controller';

@Module({
  providers: [DataPrepService, LoggingService],
  controllers: [DataPrepController],
})
export class DataPrepModule {}
