import { Controller, Get, Put, Param } from '@nestjs/common';
import { GithubCsvService } from './github-csv.service';
import { Tree } from './interfaces/tree.interface';

interface TreeData {
  files: Tree[];
  isCached: boolean;
  lastSaved: string;
}

@Controller('api/github-csv')
export class GithubCsvController {
  constructor(private githubCsvService: GithubCsvService) {}

  @Get()
  async findAll(): Promise<TreeData> {
    const isCached = this.githubCsvService.useCache();
    const lastSaved = this.githubCsvService.lastLoadTime
      ? this.githubCsvService.lastLoadTime.format()
      : '';
    const files = await this.githubCsvService.getFiles();
    return {
      files,
      isCached,
      lastSaved,
    };
  }

  @Put(':path')
  async import(@Param('path') path: string) {}
}
