import { ErrorRequestHandler } from 'express';
import { BaseError } from './base-error';
import { isUndefined } from 'st-utils';

export interface ErrorMiddlewareOptions {
  production: boolean;
}

export function errorMiddleware(options: ErrorMiddlewareOptions): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof BaseError) {
      const errorJson = err.toJSON();
      if (options.production && !isUndefined(errorJson.stack)) {
        errorJson.stack = undefined;
      }
      res.status(err.statusCode).send(errorJson);
    } else {
      next(err);
    }
  };
}
