import { BaseError, BaseErrorParams } from '../error/base-error';

export type HttpErrorParams = BaseErrorParams;

export class HttpError extends BaseError {
  constructor(params: HttpErrorParams) {
    super(params);
  }
}
