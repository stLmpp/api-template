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
    this._loadConfig();
    this._logger = this.injector.get(LoggerFactory).create('Api');
    this._loadControllers()._app.use(errorMiddleware());
  }

  private readonly _app: Application;
  private readonly _prefix: string;
  private readonly _logger: Logger;

  readonly name: string;

  private _loadController(instance: any, metadata: ControllerMetadata): this {
    for (const [key, route] of metadata.routes) {
      const routePath = join('/', this._prefix, '/', metadata.path, '/', route.path);
      this._app[route.method](routePath, async (req, res, next) => {
        try {
          const result = await instance[key](...route.params.map(paramMetadata => paramMetadata.parser(req)));
          if (result instanceof Result) {
            res.send(result.toJSON());
          } else {
            res.send(result);
          }
        } catch (error) {
          next(error);
        }
      });
      this._logger.info(`(${route.method.toUpperCase()}) ${routePath} loaded`);
    }
    return this;
  }

  private _loadControllers(): this {
    const entries = this.controllerMetadataStore.entries();
    for (const [controller, metadata] of entries) {
      this._logger.info(`${controller.name} loaded`);
      const instance = this.injector.get(controller);
      this._loadController(instance, metadata);
    }
    return this;
  }

  private _loadConfig(): this {
    const baseEnvironment = this.injector.get(BaseEnvironment);
    this.injector.set(
      LoggerFactory,
      new LoggerFactory({ production: !baseEnvironment.isDev, path: this.options.logger?.path ?? '/' })
    );
    return this;
  }

  getDefaultLogger(): Logger {
    const loggerFactory = this.injector.get(LoggerFactory);
    return loggerFactory.create(this.name);
  }

  async listen(): Promise<this> {
    const host = this.options.host ?? '127.0.0.1';
    await this._app.listen(this.options.port, host);
    this._logger.info(`Listening on ${host}:${this.options.port}`);
    return this;
  }
}
