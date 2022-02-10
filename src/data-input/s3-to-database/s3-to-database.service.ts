import { Inject, Injectable } from '@nestjs/common';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import { PrismaService } from '../../prisma/prisma.service';

import { LoggingService } from './../../logging/logging.service';
import { inspect } from 'util';
import { parse } from 'csv-parse';
import CaseRow from './CaseRow';

const { PassThrough } = require('stream');
const lGet = require('lodash/get');
const _ = require('lodash');

const MAX_DATA_ROWS = 100;

@Injectable()
export class S3ToDatabaseService {
  private prismaService;
  private s3Service;
  private loggingService;

  constructor(
    @Inject(CsvS3Service) s3Service,
    @Inject(PrismaService) prismaService,
    @Inject(LoggingService) loggingService,
  ) {
    this.s3Service = s3Service;
    this.prismaService = prismaService;
    this.loggingService = loggingService;
  }
  
  private _rows : any[];
  get rows() {
    if (!this._rows) this._rows =[];
    return this._rows;
  }
  
  private pushRow(row) {
    this.rows.push(row);
    if (this.rows.length > MAX_DATA_ROWS) {
      this.flushRows();
    }
  }
  
  private flushRows(onError = false){
    const ids = _(this.rows).map('id');
    const minId = ids.min();
    const maxId = ids.max();
    this.prismaService.covid_daily_cases.createMany({
        data: this.rows,
        skipDuplicates: true
      })
      .then(() => {
        this.loggingService.info('write records %s..%s', minId, maxId);
      })
      .catch((err) => {
        this.loggingService.error('error writing rows: %s', err.message);
      });
    this._rows = [];
  }

  public async writeS3FileRows(path: string) {
    this.loggingService.info('writeS3FileRows --- start %s', path);
    const startDate = new Date();
    await this.noteStartTime(startDate, path);

    // a read stream to an s3 file path
    let stream;

    try {
      stream = await this.s3Service.readKey(path);
      this.loggingService.info('writeS3FileRows --- got s3 file input stream');
    } catch (err) {
        this.loggingService.error('writeS3FileRows error getting stream for s3: %s', err.message);
        this.resetLog(path);
      return;
    }

    let rowCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this;
    

   const input = parse({
          cast: true,
          cast_date: true,
          columns: true,
          delimiter: ',',
          on_record: (record) => {
            const data = new CaseRow(record);
            return data.valueOf();
          },
        });
        
        input.on('data', function (row) {
        //@TODO: write to database
        // at this point we are just running over the rows
        // and incrementing the count
        if (++rowCount < 4) {
          target.pushRow(row);

          target.loggingService.info(
            'writeS3FileRows path %s --- writing row %d, %s',
            path,
            rowCount,
            JSON.stringify(row),
          );
        }
      })
      .on('error', (err) => {
        target.loggingService.error(
          'writeS3FileRows --- parse error: %s',
          err.message,
        );
        target.writeCsvError(path, err);
        target.resetLog(path);
      })
      .on('end', function () {
        target.loggingService.info('writeS3FileRows --- done');
        target.noteFinishTime(rowCount, path);
        target.flushRows();
      });
    
    stream.on('data', (chunk) => input.write(chunk.toString()));
    
    stream.once('end', () => {
      input.end();
    });
    
    stream.once('error', () => {
        target.resetLog(path);
        this.flushRows(true);
        input.end();
    });
  }

  private resetLog(path: string) {
    this.prismaService.source_files
      .update({
        where: {
          path: path,
        },
        data: {
          save_finished: null,
          save_started: null,
        },
      })
      .catch((err) => {
       this.loggingService.error(
          'error resetLog: %s, %s',
          err.message,
          path
        );
      });
  }
  
  private noteFinishTime(rowCount: number, path: string) {
    this.loggingService.log('No more rows! (row count = %d), ', rowCount);
    this.prismaService.source_files
      .update({
        where: {
          path: path,
        },
        data: {
          save_finished: new Date(),
        },
      })
      .catch((err) => {
        this.loggingService.error(
          'error noteFinishTime: %s, %s',
          err.message,
          path
        );
      });
  }

  private writeCsvError(path: string, err) {}

  private async noteStartTime(startDate: Date, path) {
    const s3Info = await this.s3Service.getBucketInfo(path);
    this.loggingService.info(
      'got s3Info for %s, = %s',
      path,
      JSON.stringify(s3Info),
    );
    await this.prismaService.source_files
      .update({
        where: {
          path: path,
        },
        data: {
          save_started: startDate,
          save_finished: null,
          file_size: lGet(s3Info, 'ContentLength', -1),
        },
      })
      .catch((err) => {
        this.loggingService.error(
          'error noteStartTime: %s, %s',
          err.message,
          path
        );
      });
  }
}
