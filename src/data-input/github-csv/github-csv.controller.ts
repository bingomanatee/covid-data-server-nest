import { Controller, Get, Put, Body } from '@nestjs/common';
import { GithubCsvService } from './github-csv.service';
import { Tree } from './interfaces/tree.interface';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import { PrismaService } from './../../prisma/prisma.service';

const { inspect } = require('util');
interface TreeData {
  files: Tree[];
  isCached: boolean;
  lastSaved: string;
}

interface LoadPathBody {
  path: string;
}

@Controller('api/github-csv')
export class GithubCsvController {
  constructor(
    private githubCsvService: GithubCsvService,
    private csvS3Service: CsvS3Service,
    private prismaService: PrismaService,
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
  @Put()
  async loadPath(@Body() body: LoadPathBody) {
    // TODO: prevent writing data already saved to s3
    console.log('body retrieved:', inspect(body));
    const { path } = body;
    if (!path) {
      return { error: 'no path param' };
    }
    return this.githubCsvService.loadPath(path);
  }
}
