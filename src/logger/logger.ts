import { format } from 'date-fns';
import { isObject } from 'st-utils';

export type LoggerLevel = 'log' | 'info' | 'debug' | 'warn' | 'error';

const logTypes: readonly LoggerLevel[] = ['log', 'info', 'debug', 'warn', 'error'];

const loggerLevelColor: Record<LoggerLevel, string> = {
  log: '\x1b[37m',
  info: '\x1b[37m',
  debug: '\x1b[34m',
  warn: '\x1b[33m',
  error: '\x1b[31m',
};

export interface LoggerFunction {
  (...args: any[]): void;
}

export class Logger {
  private constructor(public readonly name: string) {
    for (const logType of logTypes) {
      this[logType] = (...args: any[]) => this._baseLog(logType, ...args);
    }
  }

  readonly log!: LoggerFunction;
  readonly info!: LoggerFunction;
  readonly debug!: LoggerFunction;
  readonly warn!: LoggerFunction;
  readonly error!: LoggerFunction;

  private _baseLog(level: LoggerLevel, ...args: unknown[]): void {
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

  static create(name: string): Logger {
    return new Logger(name);
  }
}
