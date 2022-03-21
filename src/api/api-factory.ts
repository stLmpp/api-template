import 'reflect-metadata';
import { ApiConfigResolver } from '../config/api-config-resolver';
import { controllerMetadataStore } from '../controller/controller.metadata';
import { injector } from '../injector/injector';

import { Api } from './api';
import { ApiOptions } from './api-options';

export class ApiFactory {
  static async create(options: ApiOptions): Promise<Api> {
    const config = await injector.get(ApiConfigResolver).getConfig();
    return new Api(injector, controllerMetadataStore, options, config).init();
  }
}
