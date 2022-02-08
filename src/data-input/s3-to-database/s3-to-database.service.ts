import { Inject, Injectable } from '@nestjs/common';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import { PrismaService } from '../../prisma/prisma.service';

import { LoggingService } from './../../logging/logging.service';
import { inspect } from 'util';
import { parse } from 'csv-parse';
import lGet from 'lodash/get';
import CaseRow from './CaseRow';

const { PassThrough } = require('stream');

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

  public async writeS3FileRows(newS3File: any) {
    this.loggingService.info('writeS3FileRows --- start ');
    this.loggingService.info('writeS3FileRows: file is %s', inspect(newS3File));
    const startDate = new Date();
    await this.noteStartTime(startDate, newS3File);

    // a read stream to an s3 file

    let inputStream;

    try {
      inputStream = await this.s3Service.readKeyStream(newS3File.path);
      this.loggingService.info('writeS3FileRows --- got s3 file input stream');
    } catch (err) {
      this.loggingService.error('error getting stream for s3: %s', err.message);
      return;
    }

    let rowCount = 0;
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const target = this;
    const passthrough = new PassThrough();
    passthrough
      .on('data', function (row) {
        //@TODO: write to database
        // at this point we are just running over the rows
        // and incrementing the count
        if (++rowCount < 4) {
          console.log('A row for: ', newS3File.path, row);

          target.loggingService.info(
            'writeS3FileRows --- writing row %d, %s',
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
        target.writeCsvError(newS3File, err);
      })
      .on('end', function () {
        target.loggingService.info('writeS3FileRows --- done');
        target.noteFinishTime(rowCount, newS3File);
      });

    inputStream
      .pipe(
        parse({
          cast: true,
          cast_date: true,
          columns: true,
          delimiter: ',',
          on_record: (record) => {
            const data = new CaseRow(record);
            return data.valueOf();
          },
        }),
      )
      .pipe(passthrough);
  }

  private noteFinishTime(rowCount, newS3File: any) {
    console.log('No more rows!', rowCount, 'rows "written"', newS3File.path);
    this.prismaService.source_files
      .update({
        where: {
          path: newS3File.path,
        },
        data: {
          save_finished: new Date(),
        },
      })
      .catch((err) => {
        console.log(
          'error annotating source file end:',
          err,
          'source file =',
          newS3File,
        );
      });
  }

  private writeCsvError(newS3File: any, err) {}

  private async noteStartTime(startDate: Date, newS3File) {
    const s3Info = await this.s3Service.getBucketInfo(newS3File.path);
    this.loggingService.info(
      'got s3Info for %s, = %s',
      newS3File.path,
      JSON.stringify(s3Info),
    );
    await this.prismaService.source_files
      .update({
        where: {
          path: newS3File.path,
        },
        data: {
          save_started: startDate,
          save_finished: null,
          file_size: lGet(s3Info, 'ContentLength', -1),
        },
      })
      .catch((err) => {
        console.log(
          'error annotating source file end:',
          err,
          'source file =',
          newS3File,
        );
      });
  }
}
