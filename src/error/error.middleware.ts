import { ErrorRequestHandler } from 'express';
import { ApplicationError } from './application-error';

export interface ErrorMiddlewareOptions {
  production: boolean;
}

export function errorMiddleware(options: ErrorMiddlewareOptions): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof ApplicationError) {
      const errorJson = err.toJSON();
      if (options.production) {
        errorJson.stack = undefined;
      }
      res.status(err.statusCode).send(errorJson);
    } else {
      next(err);
    }
  };
}
