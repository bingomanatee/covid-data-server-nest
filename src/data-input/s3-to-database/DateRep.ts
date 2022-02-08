import dayjs from 'dayjs';
export const DATE_RE = /^([\d]{1,2})\/([\d]{1,2})\/([\d]{2})/;
export const DATE_DB_RE = /^([\d]{2})-([\d]{2})-([\d]{4})/;
export const DATE_DB2_RE = /^([\d]{4})-([\d]{2})-([\d]{2})/;

export default class DateRep {
  private _d: Date;
  public invalid: boolean;

  constructor(input) {
    if (!input) {
      this.invalid = true;
    } else if (typeof input === 'number') {
      this._d = new Date(input);
    } else if (input instanceof Date) {
      this._d = new Date(input.getTime());
    } else if (typeof input === 'string') {
      if (DATE_RE.test(input)) {
        const [_, month, date, year] = DATE_RE.exec(input);
        const data = {
          month: Number.parseInt(month, 10),
          date: Number.parseInt(date, 10),
          year: Number.parseInt(year, 10) + 2000,
        };
        this.parseData(data);
      } else if (DATE_DB_RE.test(input)) {
        const [_, month, date, year] = DATE_DB_RE.exec(input);
        const data = {
          month: Number.parseInt(month, 10),
          date: Number.parseInt(date, 10),
          year: Number.parseInt(year, 10),
        };
        this.parseData(data);
      } else if (DATE_DB2_RE.test(input)) {
        const [_, year, month, date] = DATE_DB2_RE.exec(input);
        const data = {
          month: Number.parseInt(month, 10),
          date: Number.parseInt(date, 10),
          year: Number.parseInt(year, 10),
        };
        this.parseData(data);
      } else {
        console.log('bad date', input, typeof input);
        this.invalid = true;
      }
    } else {
      console.log('bad date', input, typeof input);
      this.invalid = true;
    }
  }

  parseData(data) {
    if (data.year > new Date().getFullYear()) {
      this.invalid = true;
      return;
    }
    this._d = new Date(data.year, data.month - 1, data.date);
  }

  setTime(t) {
    this._d = new Date(t);
  }

  get key() {
    return dayjs(this._d).format('M/D/YY');
  }

  toString() {
    return dayjs(this._d).format('YYYY-MM-DD');
  }

  toMonthString() {
    return dayjs(this._d).format('MMM/YY');
  }

  cursorLabel() {
    return dayjs(this._d).format('MMM D, YYYY');
  }

  get label() {
    return this.key;
  }

  getYear() {
    return this._d.getFullYear();
  }

  getDate() {
    return this._d.getDate();
  }

  getMonth() {
    return this._d.getMonth();
  }

  get time() {
    return this._d.getTime();
  }

  asDate() {
    return this._d;
  }

  public static from(source) {
    if (source instanceof Date) {
      return DateRep.from(source.getTime());
    }
    return new DateRep(source);
  }
}
