import { RowObj } from './RowObj';
import { DAY_ZERO } from './constants';

const _ = require('lodash');
const dayjs = require('dayjs');

let statsWritten = 0;

/**
 * for a given location stores a nested set of maps for
 * dataType[string]: dateOffset[int] : value [int]
 */
export default class PlaceData {
  public uid: number;

  constructor(uid: number) {
    this.uid = uid;
  }

  private _stats: Map<string, Map<number, number>>;

  get stats(): Map<string, Map<number, number>> {
    if (!this._stats) {
      this._stats = new Map();
    }
    return this._stats;
  }

  get length(): number {
    return _(Array.from(this.stats.values())).map('length').max();
  }

  /***
   * calculates the minimum offset of all the stored data
   */
  getMinDate(): number {
    let min = null;

    this._stats.forEach((map, dataType) => {
      map.forEach((value, dayNum) => {
        if (min === null || dayNum < min) {
          min = dayNum;
        }
      });
    });
    return min;
  }

  digestRow(rowObj: RowObj) {
    const { deaths, confirmed, recovered } = rowObj.data;
    this.setStat('deaths', deaths, rowObj.date);
    this.setStat('confirmed', confirmed, rowObj.date);
    this.setStat('recovered', recovered, rowObj.date);
  }

  setStat(dataType: string, value: number, date, loggingService = null) {
    if (!value) return;
    if (!dayjs.isDayjs(date)) {
      return this.setStat(dataType, value, dayjs(date), loggingService);
    }

    const offset = date.diff(DAY_ZERO, 'day');

    if (loggingService && statsWritten < 20) {
      loggingService(
        'writing stat item: type %s, value %s, offset %s',
        dataType,
        value,
        offset,
      );
      ++statsWritten;
    }

    if (!this.stats.has(dataType)) {
      this.stats.set(dataType, new Map());
    }
    this.stats.get(dataType).set(offset, value);
  }

  _statRow(stat: string, data) {
    const out = [this.uid, stat];
    const offset = this.getMinDate() - out.length;
    data.forEach((value, dayOff) => {
      out[dayOff - offset] = value;
    });
    for (let index = 0; index < out.length; ++index) {
      if (!out[index]) {
        out[index] = 0;
      }
    }

    return out;
  }

  statsToRows() {
    const header = ['uid', 'stat'];
    const out = [header];
    this.stats.forEach((data, stat) => {
      // @ts-ignore
      out.push(this._statRow(stat, data));
    });

    const maxColumns = out.reduce((max, row) => {
      return Math.max(max, row.length);
    }, 0);

    let day = this.getMinDate();

    while (header.length < maxColumns) {
      // @ts-ignore
      header.push(day);
      ++day;
    }
    return out;
  }

  /**
   * express each PlaceData's stats into an array,
   * after expressing the headers. Intended for streaming to a CVS file.
   * @param callback
   */
  static outputData(headerCallback, callback, onDone) {
    throw new Error('not implemented');
  }
}
