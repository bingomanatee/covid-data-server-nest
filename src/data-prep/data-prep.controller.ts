import { Get, Controller } from '@nestjs/common';
import { DataPrepService } from './data-prep.service';

@Controller('api/data-prep')
export class DataPrepController {
  constructor(private dataPrepService: DataPrepService) {}

  @Get('consolidate')
  async consolidate() {
    await this.dataPrepService.consoldiateUSData();
    return 'consolidate';
  }
}
