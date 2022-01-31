import express, { Application } from 'express';
import { ControllerMetadata, ControllerMetadataStore } from '../controller/controller.metadata';
import { Injector } from '../injector/injector';
import { Result } from '../result/result';
import compression from 'compression';
import helmet from 'helmet';
import { errorMiddleware } from '../error/error.middleware';
import { join } from 'path';
import { Class } from 'type-fest';
import { LoggerFactory, LoggerFactoryOptions } from '../logger/logger.factory';
import { BaseEnvironment } from '../environment/base-environment';
import { Logger } from '../logger/logger';

export interface ApiOptions {
  name?: string;
  prefix?: string;
  port: number;
  host?: string;
  controllers: Class<any>[];
  logger?: Partial<Omit<LoggerFactoryOptions, 'production'>>;
}

export class Api {
  constructor(
    private readonly injector: Injector,
    private readonly controllerMetadataStore: ControllerMetadataStore,
    private readonly options: ApiOptions
  ) {
    this._prefix = this.options.prefix ?? 'api';
    this.name = this.options.name ?? 'API';
    this._app = express().use(express.json()).use(compression()).use(helmet());
    this._loadConfig()._loadControllers()._app.use(errorMiddleware());
  }

  private readonly _app: Application;
  private readonly _prefix: string;

  readonly name: string;

  private _loadController(instance: any, metadata: ControllerMetadata): this {
    for (const [key, route] of metadata.routes) {
      this._app[route.method](join('/', this._prefix, '/', metadata.path, '/', route.path), async (req, res, next) => {
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

  private _loadConfig(): this {
    const baseEnvironment = this.injector.resolve(BaseEnvironment);
    this.injector.add(
      LoggerFactory,
      new LoggerFactory({ production: !baseEnvironment.isDev, path: this.options.logger?.path ?? '/' })
    );
    return this;
  }

  getDefaultLogger(): Logger {
    const loggerFactory = this.injector.resolve(LoggerFactory);
    return loggerFactory.create(this.name);
  }

  async listen(): Promise<this> {
    await this._app.listen(this.options.port, this.options.host ?? '127.0.0.1');
    return this;
  }
}
