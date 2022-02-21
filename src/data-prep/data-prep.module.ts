import { Module } from '@nestjs/common';
import { LoggingService } from './../logging/logging.service';
import { DataPrepService } from './data-prep.service';
import { DataPrepController } from './data-prep.controller';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [DataPrepService, LoggingService, PrismaService],
  controllers: [DataPrepController],
})
export class DataPrepModule {}
