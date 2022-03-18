import { LoggerFactory } from './logger.factory';
import { Logger } from './logger';

describe('LoggerFactory', () => {
  let loggerFactory: LoggerFactory;

  beforeEach(() => {
    loggerFactory = new LoggerFactory();
  });

  it('should create logger', () => {
    const logger = loggerFactory.create('test');
    expect(logger).toBeInstanceOf(Logger);
  });
});
