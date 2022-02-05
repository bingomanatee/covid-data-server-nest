import { Inject, Injectable } from '@nestjs/common';
import { CsvS3Service } from '../csv-s3/csv-s3.service';
import { PrismaService } from '../../prisma/prisma.service';
import CsvReadableStream from 'csv-reader';
import _ from 'lodash';

@Injectable()
export class S3ToDatabaseService {
  private prismaService;
  private s3Service;

  constructor(
    @Inject(CsvS3Service) s3Service,
    @Inject(PrismaService) prismaService,
  ) {}

  public async writeS3FileRows(newS3File: any) {
    const startDate = new Date();
    await this.noteStartTime(startDate, newS3File);

    // a read stream to an s3 file
    const inputStream = await this.s3Service.readKeyStream(newS3File.path);

    let rowCount = 0;
    inputStream
      .pipe(
        new CsvReadableStream({
          parseNumbers: true,
          parseBooleans: true,
          trim: true,
        }),
      )
      .on('data', function (row) {
        //@TODO: write to database
        // at this point we are just running over the rows
        // and incrementing the count
        if (++rowCount < 4) console.log('A row for: ', newS3File.path, row);
      })
      .on('error', (err) => {
        this.writeCsvError(newS3File, err);
      })
      .on('end', function () {
        this.noteFinishTime(rowCount, newS3File, startDate);
      });
  }

  private noteFinishTime(rowCount, newS3File: any, startDate: Date) {
    console.log('No more rows!', rowCount, 'rows "written"', newS3File.path);
    this.prismaService.source_files
      .update({
        where: {
          path: newS3File.file.path,
        },
        data: {
          save_started: startDate,
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
    await this.prismaService.source_files
      .update({
        where: {
          path: newS3File.file.path,
        },
        data: {
          save_started: startDate,
          save_finished: null,
          file_size: _.get(newS3File, 's3Data.ContentLength', -1),
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
