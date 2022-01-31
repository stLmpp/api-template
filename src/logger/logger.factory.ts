import { Logger } from './logger';

export interface LoggerFactoryOptions {
  production: boolean;
  path: string;
}

export class LoggerFactory {
  constructor(private options: LoggerFactoryOptions) {}

  create(name: string): Logger {
    return Logger.create(name, { production: this.options.production, path: this.options.path });
  }
}
