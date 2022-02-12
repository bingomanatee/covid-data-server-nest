import { Inject, Injectable } from '@nestjs/common';
import { Tree } from './interfaces/tree.interface';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';
import { Cron } from '@nestjs/schedule';

import { S3ToDatabaseService } from '../s3-to-database/s3-to-database.service';
import { FileInfo } from './file.info';
import { LoggingService } from './../../logging/logging.service';

const lGet = require('lodash/get');
const GitHub = require('github-api');
const dayjs = require('dayjs');
const path = require('path');
const _ = require('lodash');

const cred = {
  token: process.env.GITHUB_TOKEN,
};

// unauthenticated client
@Injectable()
export class GithubCsvService {
  public lastLoadTime: any;

  private s3Service: any;
  private prismaService: any;
  private s3ToDB: any;
  private loggingService: any;
  _loading: any;

  constructor(
    @Inject(CsvS3Service) s3Service,
    @Inject(PrismaService) prismaService,
    @Inject(S3ToDatabaseService) s3ToDB,
    @Inject(LoggingService) loggingService,
  ) {
    this.s3Service = s3Service;
    this.prismaService = prismaService;
    this.s3ToDB = s3ToDB;
    this.loggingService = loggingService;
  }

  private _gh;
  get gh() {
    if (!this._gh) {
      this._gh = new GitHub(cred);
    }
    return this._gh;
  }

  private _files;
  get files(): Tree[] {
    if (!this._files) this._files = [];
    return this._files;
  }

  set files(values: Tree[]) {
    this._files = values;
  }

  private _repo = null;
  get repo() {
    if (!this._repo) {
      this._repo = this.gh.getRepo(
        'Lucas-Czarnecki',
        'COVID-19-CLEANED-JHUCSSE',
      );
    }
    return this._repo;
  }

  public async climbTree(
    path: string | Array<string>,
    tree: Tree,
  ): Promise<Array<Tree>> {
    if (!Array.isArray(path)) {
      return this.climbTree(path.split('/'), tree);
    }

    const { sha } = tree;

    let response;
    try {
      response = await this.repo.getTree(sha).catch((err) => {
        this.loggingService.error(
          'climbTree: error getting data from github: %s',
          err.message,
        );
        throw err;
      });
    } catch (err) {
      this.loggingService.error(
        'climbTree: error/2 getting data from github: %s',
        err.message,
      );
      return [];
    }

    const { data } = response;
    if (!path.length) return data.tree;

    const dir = path.shift();

    const subTree = data.tree.find((t) => t.path === dir);
    if (!subTree) {
      return null;
    }

    return this.climbTree(path, subTree);
  }

  public useCache() {
    return this.lastLoadTime && this.lastLoadTime.diff(dayjs(), 'minutes') < 5;
  }

  public async getFiles(withS3 = false): Promise<Array<Tree | FileInfo>> {
    await this.loadFiles();
    const keys = await this.s3Service.getBucketKeys();
    this.files = this.files.map((file) => {
      return {
        ...file,
        isStored: !!keys.find((object) => object.Key === file.path),
      };
    });
    if (withS3) {
      const files = [...this.files];
      const s3Data = await Promise.all(
        files.map((file) => this.s3Service.getBucketInfo(file.path)),
      );

      return files.map((file, i) => {
        return { file, s3Data: s3Data[i] };
      });
    } else return this.files;
  }

  public async getFile(path: string, skipCache = false) {
    if (skipCache || this.useCache()) await this.loadFiles();
    const out = this.files.find((file) => file.path === path);
    if (!skipCache && !out) return this.getFile(path, true);
    return out;
  }

  public async writePathToS3(path: string) {
    this.loggingService.log('writePathToS3: loading %s', path);
    const file = await this.getFile(path);
    if (!file) {
      this.loggingService.error('writePathToS3: cannot retrive file for %s', path);
      return;
    }
    try {
      const fileString = await this.fetchFileFromGithub(file);
      this.loggingService.log(
        'writePathToS3: loaded %s (size= %s}',
        path,
        fileString.length,
      );

      await this.s3Service.writeStringToKey(path, fileString);
      this.loggingService.log(
        'writePathToS3: wrote %s (size= %s}',
        path,
        fileString.length,
      );
    } catch (err) {
      this.loggingService.error('writePathToS3: %s error %s', path, err.message);
      return { error: err.message };
    }
    
    try {
      const s3Info = await this.s3Service.getBucketInfo(path);
  
      if (s3Info) {
        this.loggingService.log(
          'writePathToS3: file data saved as: %s',
          JSON.stringify(s3Info),
        );
        return s3Info;
      } else {
        this.loggingService.error('writePathToS3 --- file saved; cannot retrieve bucket data for path %s', path);
      }
    } catch (err) {
      this.loggingService.error('writePathToS3 ---- error getting / saving s3Info: %s', err.message);
      return {error: err.message};
    }
  
  }

  public async updateSourceFileDataForPath(path, data): Promise<any> {
    if (data && data.ContentLength) {
      //ts-ignore
      await this.prismaService.source_files
        .upsert({
          where: {
            path: path,
          },
          update: {
            file_size: data.ContentLength,
            save_started: null,
            save_finished: null,
          },
          create: {
            path: path,
            file_size: data.ContentLength,
            save_started: null,
            save_finished: null,
          },
        })
        .then((result) => {
          console.log('file size updated; result = ', result);
        });
    } else {
      console.log('not saving s3 data = no length in ', data);
    }

    return await this.prismaService.source_files.findUnique({
      where: {
        path: path,
      },
    });
  }

  public async fetchFileFromGithub(file: Tree): Promise<any> {
    const { sha, path, url } = file;

    return new Promise(async (done, fail) => {
      if (path) {
        try {
          const fileUrl = `https://raw.githubusercontent.com/Lucas-Czarnecki/COVID-19-CLEANED-JHUCSSE/master/COVID-19_CLEAN/csse_covid_19_clean_data/${path}`;
          const response = await axios.get(fileUrl);
          done(response.data);
        } catch (e) {
          console.log('error requesting ', e);
        }
      } else {
        fail(new Error('no path'));
      }
    });
  }

  async _loadFilesFromRaw() {
    const PATH_TEMPLATE =
      'https://raw.githubusercontent.com/Lucas-Czarnecki/COVID-19-CLEANED-JHUCSSE/master/COVID-19_CLEAN/csse_covid_19_clean_data/CSSE_DailyReports{#}.csv';

    const files = [];

    const inc = 1;
    while (inc < 10) {
      const fullPath = PATH_TEMPLATE.replace('{#}', inc <= 1 ? '' : `${inc}`);
      try {
        const response = await axios.head(fullPath);
        const name = path.basename(fullPath);
        files.push({
          path: name,
          sha: null,
          size: Number.parseInt(response.headers['content-length']),
        });
      } catch (err) {
        break;
      }
    }
    this.files = files;
    console.log('raw files retrieved:', files);
    return files;
  }

  private async loadFiles() {
    let response;
    if (this._loading) return;

    this._loading = true;
    try {
      response = await this.repo.getBranch('master');
    } catch (err) {
      this.loggingService.error(
        'github-csv-service: loadFiles error: %s',
        err.message,
      );
    }
    this._loading = false;

    if (!response) {
      this._loadFilesFromRaw();
      return;
    }

    const { data: branch } = response;

    const {
      commit: {
        commit: { tree },
      },
    } = branch;

    const subTree = await this.climbTree(
      'COVID-19_CLEAN/csse_covid_19_clean_data',
      tree,
    );
    this.files = subTree.filter((t) =>
      /^CSSE_DailyReports[\d]*\.csv$/.test(t.path),
    );
    this.lastLoadTime = dayjs();
  }

  /**
   * This repeated task looks at source_files table
   * and loads data from one of the files that the source-files record
   * does not have a write-start date .
   */
  @Cron('0 */30 * * * *')
  async loadDataFromS3Files() {
    this.loggingService.log('loadDataFromS3Files ------ start');
    const fileList = await this.getFiles(true);

    this.loggingService.log(
      'loadDataFromS3Files checking files %s',
      JSON.stringify(_.map(fileList, 'file.path')),
    );

    const loadPaths = this.getNewOrChangedPaths(fileList as FileInfo[]);
    this.loggingService.log(
      'loadDataFromS3Files ---- loadPaths is %s (%d count)',
      loadPaths.join(', '),
      loadPaths.length,
    );
    await Promise.all(loadPaths.map((path) => this.writePathToS3(path)));

    return fileList;
  }
  
  /**
   * normalize locations from data
   */
  @Cron('0 0 */8 * * *')
  async digestUSAData() {
    this.s3ToDB.getUSAData();
  }
  
  /**
   * normalize locations from data
   */
  @Cron('0 0 */12 * * *')
  async digestLocations() {
    this.s3ToDB.digestLocations();
  }

  /**
   * This is a repeated routine that looks at the first
   * un-loaded source (s3) file -- indicated by the absence of save_started --
   * and writes its rows to the dataset
   */
  @Cron('0 */6 * * * *')
  async writeS3Data() {
    this.loggingService.log('>> writeS3Data -- start');
    const newS3File = await this.firstUnsavedSourceFile();
    this.loggingService.log(
      'writeS3Data first unfinished row: %s',
      newS3File ? JSON.stringify(newS3File) : '(none)',
    );

    if (newS3File) {
      try {
        await this.s3ToDB.writeS3FileRows(newS3File.path); // note - not waiting for async result here
      } catch (err) {
        this.loggingService.error('writeS3Data: error %s', err.message);
      }
    }
  }

/**
 * compares github stored data against s3 stored data
 * and returns files for which the size is different or the s3 data is absent.
 * note - does NOT reference/care about stored_files db table
 */
  private getNewOrChangedPaths(fileList: FileInfo[]) {
    const changed = [];
    fileList.forEach(({ file, s3Data }) => {
      const s3Size = lGet(s3Data, 'ContentLength');
      if (!s3Data) {
        this.loggingService.info('getNewOrChangedPaths: no s3 data for file %s: calling loadData', file.path)
        changed.push(file.path);
      } else if (s3Size !== file.size) {
         this.loggingService.info('getNewOrChangedPaths: file size change for file %s: (s3 - %s vs file - %s) calling loadData',
            file.path, s3Size, file.size)
         changed.push(file.path);
      }
    });
    return changed;
  }

  private async firstUnsavedSourceFile() {
    return this.prismaService.source_files.findFirst({
      where: {
        save_started: null,
      },
      orderBy: {
        path: 'asc',
      },
    });
  }
}
