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
import { I18nOptions } from '../i18n/i18n-options';
import { i18nMiddleware } from '../i18n/i18n-middleware';
import { ApiCachedConfiguration } from './api-cached-configuration';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { generateI18n } from '../i18n/generate-i18n';
import { pathExists } from '../utils/path-exists';
import { applyPrettier } from '../prettier/apply-prettier';

export interface ApiOptions {
  name?: string;
  prefix?: string;
  port: number;
  host?: string;
  controllers: Class<any>[];
  logger?: Partial<Omit<LoggerFactoryOptions, 'production'>>;
  i18nOptions?: Partial<I18nOptions>;
}

export class Api {
  constructor(
    private readonly injector: Injector,
    private readonly controllerMetadataStore: ControllerMetadataStore,
    private readonly options: ApiOptions
  ) {
    this._i18nOptions = {
      path: this.options.i18nOptions?.path ?? 'src/i18n',
      filename: 'i18n.json',
      defaultLanguage: this.options.i18nOptions?.defaultLanguage,
    };
    this._prefix = this.options.prefix ?? 'api';
    this.name = this.options.name ?? 'API';
    this._app = express()
      .use(express.json())
      .use(compression())
      .use(helmet())
      .use(i18nMiddleware({ defaultLanguage: this._i18nOptions.defaultLanguage }));
    this._loadConfig();
    this._logger = this.injector.get(LoggerFactory).create('Api');
  }

  private _initialized = false;
  private readonly _i18nOptions: I18nOptions;
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

  private async _getOrCreateCachedConfiguration(): Promise<ApiCachedConfiguration> {
    const pathFolder = join(process.cwd(), '.api');
    const path = join(pathFolder, 'cached-configuration.json');
    if (await pathExists(path)) {
      const file = await readFile(join(process.cwd(), '.api/cached-configuration.json'));
      return JSON.parse(file.toString());
    }
    if (!(await pathExists(pathFolder))) {
      await mkdir(pathFolder);
    }
    const configuration: ApiCachedConfiguration = {};
    await writeFile(join(process.cwd(), '.api/cached-configuration.json'), JSON.stringify(configuration));
    return configuration;
  }

  private async _upsertCachedConfiguration(
    update: (configuration: ApiCachedConfiguration) => ApiCachedConfiguration
  ): Promise<this> {
    const configuration = await this._getOrCreateCachedConfiguration();
    await writeFile(
      join(process.cwd(), '.api/cached-configuration.json'),
      await applyPrettier(JSON.stringify(update(configuration)), 'json')
    );
    return this;
  }

  private async _checkI18n(): Promise<this> {
    const [configuration, i18nJson] = await Promise.all([
      this._getOrCreateCachedConfiguration(),
      readFile(join(process.cwd(), this._i18nOptions.path, this._i18nOptions.filename)).then(buffer =>
        buffer.toString()
      ),
    ]);
    const i18nJsonExists = !!configuration.i18n?.json;
    const i18nJsonHasChanged = configuration.i18n?.json && configuration.i18n.json !== i18nJson;
    if (!i18nJsonExists || i18nJsonHasChanged) {
      if (!i18nJsonExists) {
        this._logger.info('Generating i18n files');
      }
      if (i18nJsonHasChanged) {
        this._logger.info('i18n file changed. Re-generating i18n files');
      }
      await this._upsertCachedConfiguration(_configuration => ({ ..._configuration, i18n: { json: i18nJson } }));
      await generateI18n(this._i18nOptions);
    }
    return this;
  }

  getDefaultLogger(): Logger {
    const loggerFactory = this.injector.get(LoggerFactory);
    return loggerFactory.create(this.name);
  }

  async init(): Promise<this> {
    if (this._initialized) {
      return this;
    }
    await this._checkI18n();
    this._loadControllers()._app.use(errorMiddleware());
    return this;
  }

  async listen(): Promise<this> {
    const host = this.options.host ?? '127.0.0.1';
    await this._app.listen(this.options.port, host);
    this._logger.info(`Listening on ${host}:${this.options.port}`);
    return this;
  }
}
