import { HttpMethod } from '../http/http-method.enum';
import { ParamMetadata } from './param.metadata';
import { StatusCodes } from 'http-status-codes';

export class RouteMetadata {
  constructor(method?: HttpMethod, path?: string) {
    this.path = path ?? '/';
    this.method = method ?? HttpMethod.GET;
    this.params = [];
    this.httpCode = StatusCodes.OK;
  }

  path: string;
  httpCode: StatusCodes;
  method: HttpMethod;
  params: ParamMetadata[];
  returnType: any;
}
