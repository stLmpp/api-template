import { Logger } from './logger';
import { LoggerFactory } from './logger.factory';

class Service {}

describe('LoggerFactory', () => {
  let loggerFactory: LoggerFactory;

  beforeEach(() => {
    loggerFactory = new LoggerFactory();
  });

  it('should create logger', () => {
    const logger = loggerFactory.create('test');
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should create logger with class', () => {
    const logger = loggerFactory.create(Service);
    expect(logger).toBeDefined();
    expect(logger.name).toBe(Service.name);
  });

  it('should create logger with instance', () => {
    const logger = loggerFactory.create(new Service());
    expect(logger).toBeDefined();
    expect(logger.name).toBe(Service.name);
  });

  it('should throw error if constructor name is not found', () => {
    expect(() => loggerFactory.create(Object.create(null))).toThrow();
  });
});
