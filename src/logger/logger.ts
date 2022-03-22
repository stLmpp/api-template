import { format } from 'date-fns';
import { isObject } from 'st-utils';

import { LoggerFunction } from './logger-function';
import { LoggerLevel } from './logger-level';

const logTypes: readonly LoggerLevel[] = [
  LoggerLevel.debug,
  LoggerLevel.log,
  LoggerLevel.info,
  LoggerLevel.warn,
  LoggerLevel.error,
];

const loggerLevelColor: Record<LoggerLevel, string> = {
  log: '\x1b[37m',
  info: '\x1b[37m',
  debug: '\x1b[34m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

const loggerLevelMap: Record<LoggerLevel, number> = {
  [LoggerLevel.debug]: 4,
  [LoggerLevel.log]: 3,
  [LoggerLevel.info]: 2,
  [LoggerLevel.warn]: 1,
  [LoggerLevel.error]: 0,
};

export class Logger {
  private constructor(public readonly name: string, public readonly loggerLevel: LoggerLevel) {
    for (const logType of logTypes) {
      this[logType] = (...args: any[]) => this._baseLog(logType, ...args);
    }
  }

  readonly log!: LoggerFunction;
  readonly info!: LoggerFunction;
  readonly debug!: LoggerFunction;
  readonly warn!: LoggerFunction;
  readonly error!: LoggerFunction;

  private _showLog(level: LoggerLevel): boolean {
    const maxLevel = loggerLevelMap[this.loggerLevel];
    const levelNumber = loggerLevelMap[level];
    return levelNumber <= maxLevel;
  }

  private _baseLog(level: LoggerLevel, ...args: unknown[]): void {
    if (!this._showLog(level)) {
      return;
    }
    const dateString = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const resetColor = '\x1b[0m';
    const name = `\x1b[35m[${this.name}]${resetColor}`;
    const levelColor = loggerLevelColor[level];
    const levelFormatted = `${levelColor}${level}${resetColor}`.padEnd(levelColor.length + 10 + resetColor.length);
    const argsFormatted = args.reduce(
      (newArgs: unknown[], arg) => (isObject(arg) ? [...newArgs, resetColor, arg, levelColor] : [...newArgs, arg]),
      []
    );
    // eslint-disable-next-line no-console
    console[level](
      `\x1b[33m[API] - ${dateString}${resetColor} ${levelFormatted} ${name}${levelColor}`,
      ...argsFormatted,
      `${resetColor}`
    );
  }

  static create(name: string, loggerLevel: LoggerLevel): Logger {
    return new Logger(name, loggerLevel);
  }
}
