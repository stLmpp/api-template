import { ErrorRequestHandler } from 'express';
import { ApplicationError } from './application-error';

// TODO add options to error middleware

export function errorMiddleware(): ErrorRequestHandler {
  return (err, req, res, next) => {
    if (err instanceof ApplicationError) {
      res.status(err.statusCode).send(err.toJSON());
    } else {
      next(err);
    }
  };
}
