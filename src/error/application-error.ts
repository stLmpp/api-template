import { BaseError, BaseErrorParams } from './base-error';

export type ApplicationErrorParams = BaseErrorParams;

export class ApplicationError extends BaseError {
  constructor(params: ApplicationErrorParams) {
    super(params);
  }
}
