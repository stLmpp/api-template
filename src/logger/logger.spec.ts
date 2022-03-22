import { Logger } from './logger';
import { LoggerLevel } from './logger-level';

describe('Logger', () => {
  let logger: Logger;
  jest.spyOn(global.console, 'log').mockImplementation();
  jest.spyOn(global.console, 'info').mockImplementation();
  jest.spyOn(global.console, 'debug').mockImplementation();
  jest.spyOn(global.console, 'warn').mockImplementation();
  jest.spyOn(global.console, 'error').mockImplementation();
  const args = [
    'string',
    1,
    { property: 1 },
    [{ array: 1 }, 1, 'string'],
    new Map().set('key', 'value'),
    new Set().add('set1'),
  ] as const;

  beforeEach(() => {
    logger = Logger.create('test', LoggerLevel.debug);
  });

  it('should log', () => {
    logger.log(...args);
    expect(console.log).toHaveBeenCalled();
  });

  it('should info', () => {
    logger.info(...args);
    expect(console.info).toHaveBeenCalled();
  });

  it('should debug', () => {
    logger.debug(...args);
    expect(console.debug).toHaveBeenCalled();
  });

  it('should warn', () => {
    logger.warn(...args);
    expect(console.warn).toHaveBeenCalled();
  });

  it('should error', () => {
    logger.error(...args);
    expect(console.error).toHaveBeenCalled();
  });
});
