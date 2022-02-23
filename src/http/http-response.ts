import { StatusCodes } from 'http-status-codes';

export class HttpResponse<T> {
  constructor({ statusCode, data }: HttpResponse<T>) {
    this.statusCode = statusCode;
    this.data = data;
  }

  readonly statusCode: StatusCodes;
  readonly data: T;
}
