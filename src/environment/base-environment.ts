import { environmentMetadata } from './environment.metadata';
import { isNotNil } from 'st-utils';
import { EnvProp } from './env-prop.decorator';
import { config } from 'dotenv';

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
        if (metadata.converter) {
          value = metadata.converter(value);
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

  get isDev(): boolean {
    return this.nodeEnv === 'development';
  }
}
