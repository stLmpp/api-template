import { config } from 'dotenv';
import { isNotNil, isString } from 'st-utils';

import { Injectable } from '../injector/injectable.decorator';
import { LoggerLevel } from '../logger/logger-level';

import { EnvProp } from './env-prop.decorator';
import { environmentMetadata } from './environment.metadata';

function loggerLevelParser(value: LoggerLevel): LoggerLevel {
  if (!isString(value)) {
    return LoggerLevel.info;
  }
  if (!LoggerLevel[value]) {
    return LoggerLevel.info;
  }
  return value;
}

@Injectable()
export class BaseEnvironment {
  constructor() {
    if (process.env.NODE_ENV !== 'production') {
      config();
    }
    const entries = environmentMetadata.entries();
    const missingVariables: string[] = [];
    for (const [, metadata] of entries) {
      let value = process.env[metadata.name];
      if (!metadata.required || isNotNil(value)) {
        if (metadata.parser) {
          value = metadata.parser(value);
        }
      } else {
        missingVariables.push(metadata.name);
      }
      (this as any)[metadata.propertyKey] = value;
    }
    if (missingVariables.length) {
      throw new Error('Missing required environment variables: \n' + missingVariables.join('\n'));
    }
  }

  @EnvProp() readonly nodeEnv!: string;
  @EnvProp() readonly stApiEnv!: boolean;
  @EnvProp({ parser: loggerLevelParser }) readonly loggerLevel!: LoggerLevel;

  get isDev(): boolean {
    return this.nodeEnv === 'development';
  }
}
