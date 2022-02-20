import { StatusCodes } from 'http-status-codes';

export interface ApplicationErrorOptions {
  statusCode: StatusCodes;
  error: string;
  message?: string | undefined;
  id?: string | number | undefined;
  code?: string | number | undefined;
  meta?: Record<string, unknown> | undefined;
  stack?: string | undefined;
}

export class ApplicationError implements ApplicationErrorOptions {
  constructor({ statusCode, error, message, code, id, meta, stack }: ApplicationErrorOptions) {
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

  toJSON(): Omit<ApplicationErrorOptions, 'statusCode'> {
    const { statusCode, ...error } = this;
    return error;
  }
}
