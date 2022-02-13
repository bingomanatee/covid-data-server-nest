import { Module } from '@nestjs/common';
import { DataPrepService } from './data-prep.service';
import { DataPrepController } from './data-prep.controller';

@Module({ providers: [DataPrepService], controllers: [DataPrepController] })
export class DataPrepModule {}
