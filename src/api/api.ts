import express, { Application } from 'express';
import { ControllerMetadata, ControllerMetadataStore } from '../controller/controller.metadata';
import { Injector } from '../injector/injector';
import { Result } from '../result/result';
import compression from 'compression';
import helmet from 'helmet';
import { errorMiddleware } from '../error/error.middleware';
import { join } from 'path';

export interface ApiOptions {
  port: number;
  host?: string;
}

export class Api {
  constructor(
    private readonly injector: Injector,
    private readonly controllerMetadataStore: ControllerMetadataStore,
    private readonly options: ApiOptions
  ) {
    this._app = express().use(express.json()).use(compression()).use(helmet());
  }

  private readonly _app: Application;

  private _loadController(instance: any, metadata: ControllerMetadata): this {
    for (const [key, route] of metadata.routes) {
      this._app[route.method](join('/', metadata.path, '/', route.path), async (req, res, next) => {
        try {
          const result = await instance[key](...route.params.map(callback => callback(req)));
          if (result instanceof Result) {
            res.send(result.toJSON());
          } else {
            res.send(result);
          }
        } catch (error) {
          next(error);
        }
      });
    }
    return this;
  }

  private _loadControllers(): this {
    const entries = this.controllerMetadataStore.getEntries();
    for (const [controller, metadata] of entries) {
      const instance = this.injector.resolve(controller);
      this._loadController(instance, metadata);
    }
    return this;
  }

  async bootstrap(): Promise<this> {
    await this._loadControllers()
      ._app.use(errorMiddleware())
      .listen(this.options.port, this.options.host ?? process.env.HOST ?? '127.0.0.1');
    return this;
  }
}
