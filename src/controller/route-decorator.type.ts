import { StatusCodes } from 'http-status-codes';

export interface RouteDecoratorOptions {
  path?: string;
  httpCode?: StatusCodes;
  responseType?: any;
  bodyType?: any;
}

export interface RouteDecoratorType {
  (options?: RouteDecoratorOptions): MethodDecorator;
}
