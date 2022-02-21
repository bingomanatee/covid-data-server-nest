import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { stringify } from 'csv-stringify';

import PlaceData from './PlaceData';
import * as fs from 'fs';
const _ = require('lodash');

const CHUNK_SIZE = 1000;
const BASE_REQ = {
  take: CHUNK_SIZE,

  orderBy: {
    id: 'asc',
  },
};

@Injectable()
export class DataPrepService {
  private prismaService: any;
  constructor(@Inject(PrismaService) prismaService) {}

  async writeCSVfile() {
    await this.consoldiateUSData();

    let writer;
    const fileStream = fs.createWriteStream('.tmp/usData.csv');

    PlaceData.outputData(
      (columns) => {
        writer = stringify({
          header: true,
          columns: columns,
        });

        writer.on('readable', function () {
          let row;
          while ((row = writer.read()) !== null) {
            fileStream.write(row);
          }
        });
        // Catch any error
        writer.on('error', function (err) {
          console.error(err.message);
        });
        // When finished, validate the CSV output with the expected value
        writer.on('finish', function () {
          fileStream.end();
        });
      },
      (row) => {
        writer.write(row);
      },
      () => {
        writer.end();
      },
    );
  }

  async consoldiateUSData() {
    PlaceData.init();
    let cursor = undefined;
    do {
      const results = await this.getChunkOfResults(cursor);
      if (!results || results.length < 1) {
        cursor = null;
        break;
      }

      this.consolidate(results);

      cursor = _.last(results).id;
    } while (cursor);
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

      PlaceData.setPDStat(uid, 'confirmed', confirmed, date_published);
      PlaceData.setPDStat(uid, 'deaths', deaths, date_published);
      PlaceData.setPDStat(uid, 'recovered', recovered, date_published);
      PlaceData.setPDStat(uid, 'active', active, date_published);
    });
  }
}
