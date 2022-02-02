import { Controller, Get, Put, Body } from '@nestjs/common';
import { GithubCsvService } from './github-csv.service';
import { Tree } from './interfaces/tree.interface';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import {PrismaService} from './../../prisma/prisma.service';

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
  
  private async updateInfoOfS3(path, data) {
      if (data && data.Length) {
        //ts-ignore
         await this.prismaService.source_files.upsert({
          where: {
            path: path,
          },
          update: {
            file_size: data.Length,
            save_started: null,
            save_finished: null,
          },
          create: {
            path: path,
            file_size: data.Length,
            save_started: null,
            save_finished: null,
          },
        });
      }
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
    const file = await this.githubCsvService.getFile(path);
    try {
      const fileString = await this.githubCsvService.fetchFileFromGithub(file);
      console.log('file fetched from github');
      
      const result = await this.csvS3Service.writeStringToKey(path, fileString);
      console.log('s3 written', result);
      
      try {
        const s3Info = await this.csvS3Service.getBucketInfo(path);
        await this.updateInfoOfS3(path, s3Info);
        const savedFileData = await this.prismaService.source_files.findUnique({
          where: {
            path: path,
          },
        });
        if (savedFileData) {
          return savedFileData;
        } else {
          throw new Error('file saved; cannot retrieve saved_files data');
        }
      } catch (err) {
        console.log('---- error getting / saving s3Info');
        throw err;
      }
      
      
    } catch (err) {
      console.log('error writing stream:', err.message);
      return { error: err.message };
    }
  }
}
