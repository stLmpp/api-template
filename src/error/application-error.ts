import { StatusCodes } from 'http-status-codes';

export interface ApplicationErrorOptions {
  statusCode: StatusCodes;
  error: string;
  message: string;
  id?: string | number | undefined;
  code?: string | number | undefined;
  meta?: Record<string, unknown> | undefined;
}

export class ApplicationError implements ApplicationErrorOptions {
  constructor({ statusCode, error, message, code, id, meta }: ApplicationErrorOptions) {
    this.statusCode = statusCode;
    this.error = error;
    this.message = message;
    this.code = code;
    this.id = id;
    this.meta = meta;
  }

  readonly statusCode: StatusCodes;
  readonly error: string;
  readonly message: string;
  readonly code: string | number | undefined;
  readonly id: string | number | undefined;
  readonly meta: Record<string, unknown> | undefined;

  toJSON(): ApplicationErrorOptions {
    return { ...this };
  }
}
