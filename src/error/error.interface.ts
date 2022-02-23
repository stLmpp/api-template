import { StatusCodes } from 'http-status-codes';

export interface ErrorInterface {
  statusCode: StatusCodes;
  stack?: string | undefined;
}
