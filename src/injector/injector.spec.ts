import { Injectable } from './injectable.decorator';
import { Injector } from './injector';

@Injectable()
class Singleton {}

@Injectable()
class SingletonWithDependencies {
  constructor(public readonly singleton: Singleton) {}
}

describe('Injector', () => {
  let injector: Injector;

  beforeEach(() => {
    injector = new Injector();
  });

  it('should return instance of injectable', () => {
    const singleton = injector.get(Singleton);
    expect(singleton).toBeDefined();
    expect(singleton).toBeInstanceOf(Singleton);
  });

  it('should return instance of injectable with dependencies', () => {
    const singletonWithDependencies = injector.get(SingletonWithDependencies);
    expect(singletonWithDependencies).toBeDefined();
    expect(singletonWithDependencies).toBeInstanceOf(SingletonWithDependencies);
    expect(singletonWithDependencies.singleton).toBeDefined();
    expect(singletonWithDependencies.singleton).toBeInstanceOf(Singleton);
  });

  it('should return cached version of injectable', () => {
    const singleton1 = injector.get(Singleton);
    const singleton2 = injector.get(Singleton);
    expect(singleton1).toBe(singleton2);
  });
});
