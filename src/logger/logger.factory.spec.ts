import { getMockBaseEnvironment } from '../environment/base-environment.mock';

import { Logger } from './logger';
import { LoggerLevel } from './logger-level';
import { LoggerFactory } from './logger.factory';

class Service {}

describe('LoggerFactory', () => {
  let loggerFactory: LoggerFactory;
  const mockBaseEnvironment = getMockBaseEnvironment();

  beforeEach(() => {
    loggerFactory = new LoggerFactory(mockBaseEnvironment);
    jest.spyOn(mockBaseEnvironment, 'loggerLevel', 'get').mockReturnValue(LoggerLevel.debug);
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
