import { StatusCodes } from 'http-status-codes';
import { ErrorInterface } from './error.interface';

export interface ApplicationErrorInterface extends ErrorInterface {
  error: string;
  message?: string | undefined;
  id?: string | number | undefined;
  code?: string | number | undefined;
  meta?: Record<string, unknown> | undefined;
}

export class ApplicationError implements ApplicationErrorInterface {
  constructor({ statusCode, error, message, code, id, meta, stack }: ApplicationErrorInterface) {
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
    this.code = code;
    this.id = id;
    this.meta = meta;
    this.stack = stack;
  }

  readonly statusCode: StatusCodes;
  readonly error: string;
  readonly message: string | undefined;
  readonly code: string | number | undefined;
  readonly id: string | number | undefined;
  readonly meta: Record<string, unknown> | undefined;
  readonly stack: string | undefined;

  toJSON(): Omit<ApplicationErrorInterface, 'statusCode'> {
    const { statusCode, ...error } = this;
    return error;
  }
}
