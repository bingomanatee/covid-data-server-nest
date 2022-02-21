const _ = require('lodash');
const dayjs = require('dayjs');

const DAY_ZERO = dayjs(new Date(2020, 0, 1));

const pdRegistry = new Map();
let statsWritten = 0;

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
  
  static maxOffset = 0

  setStat(dataType: string, value: number, date, loggingService = null) {
    if (!value) return;
    if (!(dayjs.isDayjs(date))) {
      return this.setStat(dataType, value, dayjs(date), loggingService);
    }

    const offset = DAY_ZERO.diff(date, 'day');
    
    if (loggingService && (statsWritten < 20)) {
      loggingService('writing stat item: type %s, value %s, offset %s', 
        dataType, value, offset
      );
      ++statsWritten;
    }
    
    if (offset < PlaceData.maxOffset) {
      PlaceData.maxOffset = offset;
    }
    
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

  static setPDStat(uid: number, dataType: string, value: number, date, loggingService) {
    const pd = PlaceData.getPlaceData(uid);
    pd.setStat(dataType, value, date, loggingService);
  }

  static init() {
    pdRegistry.clear();
  }
}
