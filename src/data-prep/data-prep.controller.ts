import { Get, Controller } from '@nestjs/common';
import { DataPrepService } from './data-prep.service';
import { LoggingService } from 'src/logging/logging.service';

@Controller('api/data-prep')
export class DataPrepController {
  constructor(
    private dataPrepService: DataPrepService,
    private loggingService: LoggingService,
    ) {}

  @Get('write-csv')
  async writeCSVfile() {
    this.loggingService.info('data-prep controller: writing csv service');
    await this.dataPrepService.writeCSVfile();
    return 'consolidate';
  }
}
