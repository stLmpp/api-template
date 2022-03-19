import { mkdir, readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import compression from 'compression';
import express, { Application, json } from 'express';
import helmet from 'helmet';
import { Class } from 'type-fest';

import { API_CACHE_FILE, API_CACHE_FOLDER } from '../constants/constants';
import { ControllerMetadata, ControllerMetadataStore } from '../controller/controller.metadata';
import { BaseEnvironment } from '../environment/base-environment';
import { errorMiddleware } from '../error/error.middleware';
import { generateI18n } from '../i18n/generate-i18n';
import { i18nMiddleware } from '../i18n/i18n-middleware';
import { I18nOptions } from '../i18n/i18n-options';
import { I18nOptionsInternal } from '../i18n/i18n-options-internal';
import { Injector } from '../injector/injector';
import { Logger } from '../logger/logger';
import { LoggerFactory } from '../logger/logger.factory';
import { PathUtils } from '../path/path-utils';
import { applyPrettier } from '../prettier/apply-prettier';
import { Result } from '../result/result';
import { pathExists } from '../utils/path-exists';

import { ApiCachedConfiguration } from './api-cached-configuration';

export interface ApiOptions {
  name?: string;
  prefix?: string;
  port: number;
  host?: string;
  controllers: Class<any>[];
  i18nOptions?: Partial<I18nOptions>;
}

export class Api {
  constructor(
    private readonly injector: Injector,
    private readonly controllerMetadataStore: ControllerMetadataStore,
    private readonly options: ApiOptions
  ) {
    this._baseEnvironment = this.injector.get(BaseEnvironment);
    this._pathUtils = this.injector.get(PathUtils);
    this._i18nOptions = {
      appPath: this._pathUtils.joinRootApp(this.options.i18nOptions?.path ?? 'src/i18n'),
      libPath: this._pathUtils.joinRootLib('src/i18n'),
      filename: this.options.i18nOptions?.filename ?? 'i18n.json',
      defaultLanguage: this.options.i18nOptions?.defaultLanguage,
    };
    this._prefix = this.options.prefix ?? '';
    this.name = this.options.name ?? 'API';
    this._app = express()
      .use(json())
      .use(compression())
      .use(helmet())
      .use(i18nMiddleware({ defaultLanguage: this._i18nOptions.defaultLanguage }));
    this._loadConfig();
    this._logger = this.injector.get(LoggerFactory).create('Api');
  }

  private _initialized = false;
  private readonly _i18nOptions: I18nOptionsInternal;
  private readonly _app: Application;
  private readonly _prefix: string;
  private readonly _logger: Logger;
  private readonly _baseEnvironment: BaseEnvironment;
  private readonly _pathUtils: PathUtils;

  readonly name: string;

  private _loadController(instance: any, metadata: ControllerMetadata): this {
    for (const [key, route] of metadata.routes) {
      const routePath = join('/', this._prefix, '/', metadata.path, '/', route.path);
      this._app[route.method](routePath, async (req, res, next) => {
        try {
          const result = await instance[key](...route.params.map(paramMetadata => paramMetadata.parser(req)));
          if (result instanceof Result) {
            res.status(route.httpCode).send(result.toJSON());
          } else {
            res.status(route.httpCode).send(result);
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
    this.injector.set(LoggerFactory, new LoggerFactory());
    return this;
  }

  private async _getOrCreateCachedConfiguration(): Promise<ApiCachedConfiguration> {
    const pathFolder = this._pathUtils.joinRootApp(API_CACHE_FOLDER);
    const pathFile = join(pathFolder, API_CACHE_FILE);
    if (await pathExists(pathFile)) {
      const file = await readFile(pathFile);
      return JSON.parse(file.toString());
    }
    if (!(await pathExists(pathFolder))) {
      await mkdir(pathFolder);
    }
    const configuration: ApiCachedConfiguration = {};
    await writeFile(pathFile, JSON.stringify(configuration));
    return configuration;
  }

  private async _upsertCachedConfiguration(
    update: (configuration: ApiCachedConfiguration) => ApiCachedConfiguration
  ): Promise<this> {
    const configuration = await this._getOrCreateCachedConfiguration();
    await writeFile(
      this._pathUtils.joinRootApp(API_CACHE_FOLDER, API_CACHE_FILE),
      await applyPrettier(JSON.stringify(update(configuration)), 'json')
    );
    return this;
  }

  private async _checkI18n(): Promise<this> {
    const [configuration, i18nJson] = await Promise.all([
      this._getOrCreateCachedConfiguration(),
      readFile(join(this._i18nOptions.appPath, this._i18nOptions.filename)).then(buffer => buffer.toString()),
    ]);
    const i18nJsonExists = !!configuration.i18n?.json;
    const i18nJsonHasChanged = configuration.i18n?.json && configuration.i18n.json !== i18nJson;
    if (!i18nJsonExists || i18nJsonHasChanged) {
      let loggingMessage = 'Generating i18n files';
      if (i18nJsonHasChanged) {
        loggingMessage = 'i18n file changed. Re-generating i18n files';
      }
      this._logger.info(loggingMessage);
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
    this._loadControllers()._app.use(errorMiddleware({ production: !this._baseEnvironment.isDev }));
    return this;
  }

  async listen(): Promise<this> {
    const host = this.options.host ?? '127.0.0.1';
    await this._app.listen(this.options.port, host);
    this._logger.info(`Listening on ${host}:${this.options.port}`);
    return this;
  }
}
