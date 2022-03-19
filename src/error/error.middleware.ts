import { ErrorRequestHandler } from 'express';

import { BaseError } from './base-error';

export interface ErrorMiddlewareOptions {
  production: boolean;
}

export function errorMiddleware(options: ErrorMiddlewareOptions): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof BaseError) {
      const errorJson = err.toJSON();
      errorJson.stack = err.stack;
      errorJson.name = undefined;
      if (options.production) {
        errorJson.stack = undefined;
      }
      res.status(err.statusCode).send(errorJson);
    } else {
      next(err);
    }
  };
}
