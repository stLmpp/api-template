import { BaseError, BaseErrorParams } from '../error/base-error';

export interface HttpErrorParams extends BaseErrorParams {
  error?: string | Record<string, unknown> | undefined;
}

export class HttpError extends BaseError {
  constructor(params: HttpErrorParams) {
    super(params);
    this.name = 'HttpError';
    this.error = params.error;
  }

  readonly error: string | Record<string, unknown> | undefined;
}
