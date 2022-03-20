import { StatusCodes } from 'http-status-codes';

export interface BaseErrorParams {
  statusCode: StatusCodes;
  message: string;
  errors?: string[];
  code?: string;
  metadata?: Record<string, unknown>;
}

export abstract class BaseError extends Error {
  protected constructor({ statusCode, message, errors, code, metadata }: BaseErrorParams) {
    super(message);
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors ?? [];
    this.code = code;
    this.metadata = metadata;
    this.name = 'BaseError';
  }

  readonly statusCode: StatusCodes;
  readonly errors: string[];
  readonly code: string | undefined;
  readonly metadata?: Record<string, unknown>;

  toJSON(): Record<string, unknown> {
    const { statusCode, ...error } = this;
    return error;
  }
}
