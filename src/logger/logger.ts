import { createLogger, format, LeveledLogMethod, Logger as WinstonLogger, transports } from 'winston';
import { injector } from '../injector/injector';

const logTypes = ['error', 'warn', 'info', 'debug', 'http', 'verbose', 'silly'] as const;

export class Logger {
  constructor(private name: string) {
    const color = format.colorize({ colors: { service: 'yellow', name: 'magenta' } });
    const myFormat = format.combine(
      format.align(),
      format.colorize(),
      format.label({ label: name }),
      format.timestamp({ format: 'DD/MM/YYYY HH:mm:ss' }),
      format.printf(({ level, message, label, timestamp }) => {
        const apiTimestampColor = color.colorize('service', `[API] - ${timestamp}`);
        const labelColor = color.colorize('name', `[${label}]`);
        return `${apiTimestampColor} \t${level} \t${labelColor} ${message}`;
      })
    );
    this._logger = createLogger({
      level: 'info',
      format: myFormat,
      transports: [
        new transports.File({ filename: 'logging.log' }),
        new transports.File({ filename: 'error-logging.log', level: 'error' }),
      ],
    });
    if (process.env.NODE_ENV !== 'production') {
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

  static create(name: string): Logger {
    return new Logger(name);
  }
}

injector.add(Logger, Logger.create(''));
