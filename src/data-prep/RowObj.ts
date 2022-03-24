import dayjs from 'dayjs';
import { DAY_ZERO } from './constants';

export class RowObj {
  public data: any;
  public date: any;
  private _dayNum: number | null = null;

  constructor(data) {
    this.data = data;
    this.date = dayjs(data.date_published);
  }

  get dayNum() {
    if (typeof this._dayNum !== 'number') {
      this._dayNum = this.date.diff(DAY_ZERO, 'day');
    }
    return this._dayNum;
  }
}
