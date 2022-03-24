import { Inject, Injectable } from '@nestjs/common';
import { CsvS3Service } from '../../data-input/csv-s3/csv-s3.service';
import { PrismaService } from '../../prisma/prisma.service';
import { S3ToDatabaseService } from '../../data-input/s3-to-database/s3-to-database.service';
import { LoggingService } from '../../logging/logging.service';
import { makeCruncher } from './make-cruncher';
import dayjs from 'dayjs';
import fs from 'fs';
import { stringify } from 'csv-stringify';

@Injectable()
export class UsDataCruncherService {
  private s3Service: any;
  private prismaService: any;
  private s3ToDB: any;
  private loggingService: any;

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

  async parseUsData() {
    const mirror = makeCruncher(this);

    mirror.$do.makeChunks();
    // eslint-disable-next-line @typescript-eslint/no-this-alias
    const self = this;
    mirror.value.chunks.forEach(async (chunk) => {
      //@TODO: put in actionQueue
      await chunk.$do.loadRows();
      self.writeChunk(chunk);
    });
  }

  /**
   * returns a file stream for writing CSV data to.
   */
  makeFileStream(index = 0) {
    const ts = dayjs().toISOString();
    const filename = 'usData.' + ts + '.' + index + '.csv';

    this.loggingService.info('opening %s', filename);

    try {
      return fs.createWriteStream(filename);
    } catch (err) {
      this.loggingService.error('error creating file stream: %s', err.message);
      return null;
    }
  }

  makeWriter(columns, fileStream) {
    const writer = stringify({
      header: true,
      columns: columns,
    });

    let rowReads = 0;
    const { loggingService } = this;

    writer.on('readable', function () {
      let row;
      while ((row = writer.read()) !== null) {
        if (rowReads < 2) {
          loggingService.info('read row %s', row.toString().substr(0, 200));
          ++rowReads;
        }
        fileStream.write(row);
      }
      fileStream.end();
    });
    // Catch any error
    writer.on('error', function (err) {
      loggingService.error('error in stream: %s', err.message);
    });
    // When finished, validate the CSV output with the expected value
    writer.on('finish', function () {
      loggingService.info('done reading stream');
      fileStream.end();
    });

    return writer;
  }

  async writeChunk(chunk) {
    const data = chunk.$do.pdRows();

    const columns = data.shift();
    const index = chunk.value.start;

    const fileStream = this.makeFileStream(index);
    const writer = this.makeWriter(columns, fileStream);

    data.forEach((row) => {
      writer.write(row);
    });
  }
}
