import 'reflect-metadata';
import { Api, ApiOptions } from './api';
import { controllerMetadataStore } from '../controller/controller.metadata';
import { injector } from '../injector/injector';

export class ApiFactory {
  static create(options: ApiOptions): Promise<Api> {
    return new Api(injector, controllerMetadataStore, options).init();
  }
}
