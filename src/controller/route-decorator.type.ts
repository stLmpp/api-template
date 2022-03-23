import { StatusCodes } from 'http-status-codes';

export interface RouteDecoratorOptions {
  path?: string;
  httpCode?: StatusCodes;
  responseType?: any;
  responseArray?: boolean;
}

export interface RouteDecoratorType {
  (options?: RouteDecoratorOptions): MethodDecorator;
}
