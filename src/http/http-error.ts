import { StatusCodes } from 'http-status-codes';
import { ErrorInterface } from '../error/error.interface';

export interface HttpErrorInterface extends ErrorInterface {
  message: string;
}

export class HttpError implements HttpErrorInterface {
  constructor({ statusCode, message, stack }: HttpErrorInterface) {
    this.statusCode = statusCode;
    this.message = message;
    this.stack = stack;
  }

  readonly statusCode: StatusCodes;
  readonly message: string;
  readonly stack?: string | undefined;

  toJSON(): Omit<HttpErrorInterface, 'statusCode'> {
    const { statusCode, ...error } = this;
    return error;
  }
}
