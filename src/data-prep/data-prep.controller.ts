import { Get, Controller } from '@nestjs/common';
import { DataPrepService } from './data-prep.service';

@Controller('api/data-prep')
export class DataPrepController {
  constructor(private dataPrepService: DataPrepService) {}

  @Get('write-csv')
  async writeCSVfile() {
    await this.dataPrepService.writeCSVfile();
    return 'consolidate';
  }
}
