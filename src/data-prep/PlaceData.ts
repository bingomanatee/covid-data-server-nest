import dayjs, { Dayjs } from 'dayjs';
const _ = require('lodash');

const DAY_ZERO = dayjs(new Date(2020, 0, 1));

const pdRegistry = new Map();

export default class PlaceData {
  constructor(uid: number) {}

  private _stats: Map<string, number[]>;

  get stats(): Map<string, number[]> {
    if (!this._stats) {
      this._stats = new Map();
    }
    return this._stats;
  }

  get length(): number {
    return _(Array.from(this.stats.values())).map('length').max();
  }

  setStat(dataType: string, value: number, date) {
    if (!value) return;
    if (!(date instanceof Dayjs)) {
      return this.setStat(dataType, value, dayjs(date));
    }

    const offset = DAY_ZERO.diff(date, 'day');
    if (!this.stats.has(dataType)) {
      this.stats.set(dataType, []);
    }
    this.stats.get(dataType)[offset] = value;
  }

  /**
   * express each PlaceData's stats into an array,
   * after expressing the headers. Intended for streaming to a CVS file.
   * @param callback
   */
  static outputData(headerCallback, callback, onDone) {
    const maxLength = _(Array.from(pdRegistry.values())).map('length').max();

    const dates = _.range(0, maxLength).map((offset) => {
      dayjs(DAY_ZERO).add(offset, 'day').toISOString();
    });

    const headers = ['uid', 'dataType', ...dates];
    headerCallback(headers);

    pdRegistry.forEach((pd, uid) => {
      pd.stats.forEach((list, dataType) => {
        callback([uid, dataType, ...list]);
      });
    });
    onDone();
  }

  static getPlaceData(uid) {
    if (!pdRegistry.has(uid)) {
      pdRegistry.set(uid, new PlaceData(uid));
    }
    return pdRegistry.get(uid);
  }

  static setPDStat(uid: number, dataType: string, value: number, date) {
    const pd = PlaceData.getPlaceData(uid);
    pd.setStat(dataType, value, date);
  }

  static init() {
    pdRegistry.clear();
  }
}
