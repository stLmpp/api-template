import { ErrorRequestHandler } from 'express';
import { ApplicationError } from './application-error';
import { HttpError } from '../http/http-error';

export interface ErrorMiddlewareOptions {
  production: boolean;
}

export function errorMiddleware(options: ErrorMiddlewareOptions): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof ApplicationError || err instanceof HttpError) {
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
