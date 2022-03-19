import { config } from 'dotenv';
import { isNotNil } from 'st-utils';

import { EnvProp } from './env-prop.decorator';
import { environmentMetadata } from './environment.metadata';

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

  @EnvProp() nodeEnv!: string;
  @EnvProp() stApiEnv!: boolean;

  get isDev(): boolean {
    return this.nodeEnv === 'development';
  }
}
