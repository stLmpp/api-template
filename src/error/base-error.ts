import { StatusCodes } from 'http-status-codes';

export interface BaseErrorParams {
  statusCode: StatusCodes;
  message: string;
  errors?: string[];
  code?: string;
  metadata?: Record<string, unknown>;
  stack?: string;
}

export abstract class BaseError {
  protected constructor({ statusCode, message, errors, code, metadata, stack }: BaseErrorParams) {
    this.statusCode = statusCode;
    this.message = message;
    this.errors = errors ?? [];
    this.code = code;
    this.metadata = metadata;
    this.stack = stack;
  }

  readonly statusCode: StatusCodes;
  readonly message: string;
  readonly errors: string[];
  readonly code: string | undefined;
  readonly metadata: Record<string, unknown> | undefined;
  readonly stack: string | undefined;

  toJSON(): Record<string, unknown> {
    const { statusCode, ...error } = this;
    return error;
  }
}
