import { Controller, Get, Put, Patch, Param } from '@nestjs/common';
import { GithubCsvService } from './github-csv.service';
import { Tree } from './interfaces/tree.interface';
import { CsvS3Service } from '../csv-s3/csv-s3.service';

interface TreeData {
  files: Tree[];
  isCached: boolean;
  lastSaved: string;
}

@Controller('api/github-csv')
export class GithubCsvController {
  constructor(
    private githubCsvService: GithubCsvService,
    private csvS3Service: CsvS3Service,
  ) {}

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

  /**
   * Loads the data in github into s3
   * @param path
   */
  @Put(':path')
  async loadPath(@Param('path') path: string) {
    // TODO: prevent writing data already saved to s3
    const file = await this.githubCsvService.getFile(path);
    const buffer = await this.githubCsvService.fetchFileFromGithub(file);
    const s3WriteStream = await this.csvS3Service.keyWriteStream(path);
    s3WriteStream.write(buffer);
    s3WriteStream.end();

    return buffer;
  }
}
