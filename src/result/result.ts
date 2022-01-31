export interface IResult<T> {
  data: T | undefined;
  meta: Record<string, unknown> | undefined;
}

export class Result<T> {
  constructor(data?: T, meta?: Record<string, unknown>) {
    this._data = data;
    this._meta = meta;
  }

  private _data: T | undefined;
  private _meta: Record<string, unknown> | undefined;

  setData(data: T): this {
    this._data = data;
    return this;
  }

  setMeta(meta: Record<string, unknown>): this {
    this._meta = meta;
    return this;
  }

  toJSON(): IResult<T> {
    return {
      data: this._data,
      meta: this._meta,
    };
  }
}
