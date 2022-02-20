import { HTTPMethod } from '../enum/http-method.enum';
import { ParamMetadata } from './param.metadata';
import { StatusCodes } from 'http-status-codes';

export class RouteMetadata {
  constructor(method?: HTTPMethod, path?: string) {
    this.path = path ?? '/';
    this.method = method ?? HTTPMethod.GET;
    this.params = [];
    this.httpCode = StatusCodes.OK;
  }

  path: string;
  httpCode: StatusCodes;
  method: HTTPMethod;
  params: ParamMetadata[];
  returnType: any;
}
