import { Controller, Get, Put, Body } from '@nestjs/common';
import { GithubCsvService } from './github-csv.service';
import { Tree } from './interfaces/tree.interface';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
const {inspect} = require('util');

interface TreeData {
  files: Tree[];
  isCached: boolean;
  lastSaved: string;
}

<<<<<<< HEAD
interface LoadPathParams {
  path: string
=======
interface LoadPathBody {
  path: string;
>>>>>>> bef68eab3c0ffa405b6ecec1e42d6216588e6a0f
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
<<<<<<< HEAD
  async loadPath(@Param('path') params: LoadPathParams) {
    const {path} = params;
    console.log('putting path:', path);
    if (!path) {
      return {error: 'no path param'};
    }
=======
  async loadPath(@Body() body: LoadPathBody) {
    // TODO: prevent writing data already saved to s3
    const { path } = body;
>>>>>>> bef68eab3c0ffa405b6ecec1e42d6216588e6a0f
    const file = await this.githubCsvService.getFile(path);
    console.log('found file', file);
    const buffer = await this.githubCsvService.fetchFileFromGithub(file);
    const s3WriteStream = await this.csvS3Service.keyWriteStream(path);
    console.log('write stream', s3WriteStream);
    s3WriteStream.write(buffer);
    s3WriteStream.end();

    return buffer;
  }
}
