import { StatusCodes } from 'http-status-codes';

export interface RouteDecoratorOptions {
  path?: string;
  httpCode?: StatusCodes;
}

export interface RouteDecoratorType {
  (options?: RouteDecoratorOptions): MethodDecorator;
}
