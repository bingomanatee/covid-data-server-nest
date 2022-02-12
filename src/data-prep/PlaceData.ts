import dayjs, { Dayjs } from 'dayjs';

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
}
