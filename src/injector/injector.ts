import { Class } from 'type-fest';
import { ReflectMetadataTypes } from '../utils/reflect';

export class Injector {
  constructor() {
    this._instances.set(Injector, this);
  }

  private readonly _instances = new Map<Class<any>, any>();

  resolve<T>(target: Class<T>): T {
    if (this._instances.has(target)) {
      return this._instances.get(target)!;
    }
    const params: Class<any>[] = Reflect.getMetadata(ReflectMetadataTypes.paramTypes, target);
    if (!params?.length) {
      const instance = new target();
      this.add(target, instance);
      return instance;
    }
    const injections = params.map(_target => this.resolve(_target));
    const instance = new target(...injections);
    this.add(target, instance);
    return instance;
  }

  add<T>(target: Class<T>, instance: T): this {
    this._instances.set(target, instance);
    return this;
  }
}

export const injector = new Injector();
