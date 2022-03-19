import 'reflect-metadata';
import { controllerMetadataStore } from '../controller/controller.metadata';
import { injector } from '../injector/injector';

import { Api, ApiOptions } from './api';

export class ApiFactory {
  static create(options: ApiOptions): Promise<Api> {
    return new Api(injector, controllerMetadataStore, options).init();
  }
}
