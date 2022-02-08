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
          'github-csv-service: error getting data from github: %s',
          err.message,
        );
        throw err;
      });
    } catch (err) {
      this.loggingService.error(
        'github-csv-service: error getting data from github: %s',
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
    if (!this.useCache()) await this.loadFiles();
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

  public async getFile(path: string) {
    if (!this.useCache()) await this.loadFiles();
    const out = this.files.find((file) => file.path === path);
    return out;
  }

  public async loadPath(path: string) {
    this.loggingService.log('loadPath: loading %s', path);
    const file = await this.getFile(path);
    try {
      const fileString = await this.fetchFileFromGithub(file);
      this.loggingService.log(
        'loadPath: loaded %s (size= %s}',
        path,
        fileString.length,
      );

      const result = await this.s3Service.writeStringToKey(path, fileString);

      try {
        const s3Info = await this.s3Service.getBucketInfo(path);
        const savedFileData = await this.updateSourceFileDataForPath(
          path,
          s3Info,
        );

        if (savedFileData) {
          this.loggingService.log(
            'loadPath: file data saved as: %s',
            JSON.stringify(savedFileData),
          );
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
      this.loggingService.error('loadPath: %s error %s', path, err.message);
      return { error: err.message };
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
        console.log('_loadFilesFromRaw: response headers:', response.headers);
        files.push({
          path: name,
          sha: null,
          size: Number.parseInt(response.headers['content-length']),
        });
      } catch (err) {
        break;
      }
    }
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
      return this._loadFilesFromRaw();
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
   * This repeated task looks at the github repo and loads new files into s3
   * if they are not in the database.
   */
  @Cron('0 */5 * * * *')
  async updateFilesFromGithub() {
    if (!this.loggingService) {
      console.log('--- cannot find loggingService in ', this);
    }
    this.loggingService.log('updateFilesFromGithub ------ start');
    const fileList = await this.getFiles(true);

    this.loggingService.log(
      'updateFilesFromGithub checking files %s',
      JSON.stringify(fileList),
    );

    const loadPaths = this.getNewOrChangedPaths(fileList as FileInfo[]);
    this.loggingService.log(
      'updateFilesFromGithub ---- loadPaths is %s (%d count)',
      loadPaths.join(', '),
      loadPaths.length,
    );
    await Promise.all(loadPaths.map((path) => this.loadPath(path)));

    return fileList;
  }

  /**
   * This is a repeated routine that looks at the first
   * un-loaded source (s3) file -- indicated by the absence of save_started --
   * and writes its rows to the dataset
   */
  @Cron('0 */2 * * * *')
  async writeS3Data() {
    this.loggingService.log('>> writeS3Data -- start');
    const newS3File = await this.firstUnsavedSourceFile();
    this.loggingService.log(
      'writeS3Data first unfinished row: %s',
      newS3File ? JSON.stringify(newS3File) : '(none)',
    );

    if (newS3File) {
      try {
        await this.s3ToDB.writeS3FileRows(newS3File); // note - not waiting for async result here
      } catch (err) {
        this.loggingService.error('writeS3Data: error %s', err.message);
      }
    }
  }

  private getNewOrChangedPaths(fileList: FileInfo[]) {
    const loadPaths = [];
    fileList.forEach(({ file, s3Data }) => {
      if (!s3Data || lGet(s3Data, 'ContentLength') !== file.size) {
        loadPaths.push(file.path);
      }
    });
    return loadPaths;
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
