import { Injectable, Inject } from '@nestjs/common';
const GitHub = require('github-api');
const dayjs = require('dayjs');

import { Tree } from './interfaces/tree.interface';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import axios from 'axios';
import { PrismaService } from '../../prisma/prisma.service';

const cred = {
  username: 'dave@wonderlandlabs.com',
  password: process.env.GITHUB_PASS,
};

// unauthenticated client
@Injectable()
export class GithubCsvService {
  private gh: any;
  private repo: any;
  private files: Array<Tree>;
  public lastLoadTime: any;
  private s3Service: any;
  private prismaService: any;
  constructor(
    @Inject(CsvS3Service) s3Service,
    @Inject(PrismaService) prismaService,
  ) {
    this.gh = new GitHub(cred);
    this.repo = this.gh.getRepo('Lucas-Czarnecki', 'COVID-19-CLEANED-JHUCSSE');
    this.files = [];
    this.s3Service = s3Service;
    this.prismaService = prismaService;
  }

  public async climbTree(
    path: string | Array<string>,
    tree: Tree,
  ): Promise<Array<Tree>> {
    if (!Array.isArray(path)) {
      return this.climbTree(path.split('/'), tree);
    }

    console.log('tree is ', tree);
    const { sha } = tree;

    const { data } = await this.repo.getTree(sha);
    if (!path.length) return data.tree;

    const dir = path.shift();

    const subTree = data.tree.find((t) => t.path === dir);
    if (!subTree) {
      console.log(
        'cannot find ',
        dir,
        'in',
        data.tree,
        '(remaining: ',
        path,
        ')',
      );
      return null;
    }

    return this.climbTree(path, subTree);
  }

  public useCache() {
    return this.lastLoadTime && this.lastLoadTime.diff(dayjs(), 'minutes') < 5;
  }

  public async getFiles(): Promise<Array<Tree>> {
    if (!this.useCache()) await this.loadFiles();
    const keys = await this.s3Service.getBucketKeys();
    console.log('--- bucket keys', keys);
    this.files = this.files.map((file) => {
      return {
        ...file,
        isStored: !!keys.find((object) => object.Key === file.path),
      };
    });
    return this.files;
  }

  public async getFile(path: string) {
    if (!this.useCache()) await this.loadFiles();
    const out = this.files.find((file) => file.path === path);
    console.log(
      '<<<<<<< --- found path ',
      path,
      'in',
      this.files,
      ':',
      out,
      '>>>>>>>>>>>',
    );
    return out;
  }

  public async loadPath(path: string) {
    const file = await this.getFile(path);
    try {
      const fileString = await this.fetchFileFromGithub(file);
      console.log('file fetched from github');

      const result = await this.s3Service.writeStringToKey(path, fileString);
      console.log('s3 written', result);

      try {
        const s3Info = await this.s3Service.getBucketInfo(path);
        console.log('--- retrieved s3Info', s3Info);
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

  public async updateInfoOfS3(path, data) {
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
  }

  public async fetchFileFromGithub(file: Tree): Promise<any> {
    const { sha, path, url } = file;
    console.log('fetchFileFromGithub: fetching sha', sha, 'from url', url);
    return new Promise(async (done, fail) => {
      if (path) {
        try {
          console.log('loading path', path, 'from axios');

          const fileUrl = `https://raw.githubusercontent.com/Lucas-Czarnecki/COVID-19-CLEANED-JHUCSSE/master/COVID-19_CLEAN/csse_covid_19_clean_data/${path}`;

          const response = await axios.get(fileUrl);
          console.log('got a response for ', fileUrl);
          done(response.data);
        } catch (e) {
          console.log('error requesting ', e);
        }
      } else {
        fail(new Error('no path'));
      }
    });
  }

  private async loadFiles() {
    const { data: branch } = await this.repo.getBranch('master');

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
}
