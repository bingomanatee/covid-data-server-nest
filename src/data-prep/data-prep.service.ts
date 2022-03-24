import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { stringify } from 'csv-stringify';
import { LoggingService } from './../logging/logging.service';
import PlaceData from './PlaceData';

import * as fs from 'fs';
const dayjs = require('dayjs');
const _ = require('lodash');

const CHUNK_SIZE = 5000;
const BASE_REQ = {
  take: CHUNK_SIZE,

  orderBy: {
    id: 'asc',
  },
};

// deprecated

@Injectable()
export class DataPrepService {
  private prismaService: any;
  private loggingService: any;
  constructor(
    @Inject(PrismaService) prismaService,
    @Inject(LoggingService) loggingService,
  ) {
    this.prismaService = prismaService;
    this.loggingService = loggingService;
  }

  async writeCSVfile() {
    const { loggingService } = this;

    this.loggingService.info('writeCSVfile: start');
    await this.consoldiateUSdata();
    this.loggingService.info('writeCSVfile: beginning file write');
    const ts = dayjs().toISOString();
    const filename = 'usData.' + ts + '.csv';

    loggingService.info('opening %s', filename);

    let writer;
    let fileStream;
    try {
      fileStream = fs.createWriteStream(filename);
    } catch (err) {
      this.loggingService.error('error creating file stream: %s', err.message);
      return;
    }

    let rowReads = 0;

    PlaceData.outputData(
      (columns) => {
        // column handler
        writer = stringify({
          header: true,
          columns: columns,
        });

        writer.on('readable', function () {
          let row;
          while ((row = writer.read()) !== null) {
            if (rowReads < 2) {
              loggingService.info('read row %s', row.toString().substr(0, 200));
              ++rowReads;
            }
            fileStream.write(row);
          }
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
      },
      (row) => {
        // row writer handler
        // sending data to csv streamer
        writer.write(row);
      },
      () => {
        // end handler
        writer.end();
      },
    );
  }

  async consoldiateUSdata() {
    PlaceData;
    let cursor = undefined;
    let cycles = 0;
    do {
      const results = await this.getChunkOfResults(cursor);
      if (!results || results.length < 1) {
        cursor = null;
        break;
      }

      if (cycles < 5 || !(cycles % 50)) {
        this.loggingService.info(
          'consolidateUSdata - writing chunk for cursor %s (cycle %s)',
          cursor === undefined ? '(undefined)' : cursor,
          cycles,
        );
      }
      ++cycles;

      this.consolidate(results);

      cursor = _.last(results).id;
    } while (cursor && cycles < 20);
    this.loggingService.info('done writing results; %d cycles', cycles);
  }

  private request(cursor: any) {
    if (cursor) {
      return {
        ...BASE_REQ,
        cursor: {
          id: cursor,
        },
        skip: 1,
      };
    }
    return BASE_REQ;
  }

  private async getChunkOfResults(cursor) {
    return this.prismaService.covid_daily_cases_usa.findMany(
      this.request(cursor),
    );
  }

  private consolidate(results: any[]) {
    results.forEach((row) => {
      const { uid, confirmed, deaths, recovered, active, date_published } = row;

   /*   PlaceData.setPDStat(
        uid,
        'confirmed',
        confirmed,
        date_published,
        this.loggingService,
      );
      PlaceData.setPDStat(
        uid,
        'deaths',
        deaths,
        date_published,
        this.loggingService,
      );
      PlaceData.setPDStat(
        uid,
        'recovered',
        recovered,
        date_published,
        this.loggingService,
      );
      PlaceData.setPDStat(
        uid,
        'active',
        active,
        date_published,
        this.loggingService,
      );*/
    });
  }
}
