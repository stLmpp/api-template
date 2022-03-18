import { Logger } from './logger';

export class LoggerFactory {
  create(name: string): Logger {
    return Logger.create(name);
  }
}
