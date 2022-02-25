import { createLogger, format, LeveledLogMethod, Logger as WinstonLogger, transports } from 'winston';
import { join } from 'path';

const logTypes = ['error', 'warn', 'info', 'debug', 'http', 'verbose', 'silly'] as const;

export interface LoggerOptions {
  production: boolean;
  path: string;
}

export class Logger {
  constructor(name: string, options: LoggerOptions) {
    const color = format.colorize({ colors: { service: 'yellow', name: 'magenta' } });
    const myFormat = format.combine(
      format.align(),
      format.colorize(),
      format.label({ label: name }),
      format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
      format.json(),
      format.printf(({ level, message, label, timestamp, ...params }) => {
        const apiTimestampColor = color.colorize('service', `[API] - ${timestamp}`);
        const labelColor = color.colorize('name', `[${label}]`);
        return `${apiTimestampColor} \t${level} \t${labelColor} ${message} ${JSON.stringify(params)}`;
      })
    );
    this._logger = createLogger({
      level: 'info',
      format: myFormat,
      transports: [
        new transports.File({ filename: join(options.path, '/', 'combined.log') }),
        new transports.File({ filename: join(options.path, '/', 'error.log'), level: 'error' }),
      ],
    });
    if (!options.production) {
      this._logger.add(
        new transports.Console({
          format: myFormat,
        })
      );
    }

    for (const logType of logTypes) {
      this[logType] = this._logger[logType].bind(this._logger);
    }
  }

  private readonly _logger: WinstonLogger;

  readonly error!: LeveledLogMethod;
  readonly warn!: LeveledLogMethod;
  readonly info!: LeveledLogMethod;
  readonly debug!: LeveledLogMethod;
  readonly http!: LeveledLogMethod;
  readonly verbose!: LeveledLogMethod;
  readonly silly!: LeveledLogMethod;

  static create(name: string, options: LoggerOptions): Logger {
    return new Logger(name, options);
  }
}
