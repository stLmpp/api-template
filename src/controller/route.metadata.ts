import { HTTPMethod } from '../enum/http-method.enum';
import { ParamMetadata } from './param.metadata';

export class RouteMetadata {
  constructor(method?: HTTPMethod, path?: string) {
    this.path = path ?? '/';
    this.method = method ?? HTTPMethod.GET;
    this.params = [];
  }

  path: string;
  method: HTTPMethod;
  params: ParamMetadata[];
}
