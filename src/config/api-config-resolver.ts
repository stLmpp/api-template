import { readFile } from 'fs/promises';

import { load } from 'js-yaml';
import { getFirstKey } from 'st-utils';

import { Injectable } from '../injector/injectable.decorator';
import { LoggerFactory } from '../logger/logger.factory';
import { PathUtils } from '../path/path-utils';
import { pathExists } from '../utils/path-exists';

import { ApiConfig } from './api-config';
import { ApiConfigInternal } from './api-config-internal';

@Injectable()
export class ApiConfigResolver {
  constructor(private readonly pathUtils: PathUtils, private readonly loggerFactory: LoggerFactory) {}

  private readonly _logger = this.loggerFactory.create(this);

  private async _getConfig(): Promise<ApiConfig> {
    let config: ApiConfig | null = null;
    try {
      config = (await this._tryGetTs()) ?? (await this._tryGetJson()) ?? (await this._tryGetYaml());
    } catch (error) {
      this._logger.error('Error trying to get config file', error);
    }
    if (!config) {
      this._logger.warn('Config not found. Using default configuration');
      config = {};
    }
    return config;
  }

  private async _tryGetJson(): Promise<ApiConfig | null> {
    const filePath = this.pathUtils.joinRootApp('api-config.json');
    if (await pathExists(filePath)) {
      const file = await readFile(filePath);
      return JSON.parse(file.toString());
    }
    return null;
  }

  private async _tryGetYaml(): Promise<ApiConfig | null> {
    const filePathYaml = this.pathUtils.joinRootApp('api-config.yaml');
    const filePathYml = this.pathUtils.joinRootApp('api-config.yml');
    let file: Buffer | undefined;
    if (await pathExists(filePathYaml)) {
      file = await readFile(filePathYaml);
    } else if (await pathExists(filePathYml)) {
      file = await readFile(filePathYml);
    }
    if (file) {
      const yamlParsed = load(file.toString()) as ApiConfig | undefined;
      return yamlParsed ?? {};
    }
    return null;
  }

  private async _tryGetTs(): Promise<ApiConfigInternal | null> {
    const filePath = this.pathUtils.joinRootApp('api-config.ts');
    if (await pathExists(filePath)) {
      const module = await import(filePath);
      if (module.default) {
        return module.default;
      }
      const key = getFirstKey(module);
      if (key) {
        return module[key];
      }
    }
    return null;
  }

  async getConfig(): Promise<ApiConfigInternal> {
    const config = await this._getConfig();
    return {
      ...config,
      i18nOptions: {
        filename: config.i18nOptions?.filename ?? 'i18n.json',
        defaultLanguage: config.i18nOptions?.defaultLanguage,
        libPath: this.pathUtils.joinRootLib('src/i18n'),
        appPath: this.pathUtils.joinRootApp(config.i18nOptions?.path ?? 'src/i18n'),
      },
      name: config.name ?? 'API',
      host: config.host ?? 'localhost',
      port: config.port ?? 3000,
      prefix: config.prefix ?? '',
      mainFile: 'main.ts',
    };
  }
}
