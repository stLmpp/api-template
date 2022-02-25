import { Injectable } from '../injector/injectable.decorator';
import { ValidationError } from './validation-error';
import { Class } from 'type-fest';
import { coerceArray, isArray } from 'st-utils';
import { instanceToInstance, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { formatValidationsErrors } from './format-validation-errors';
import { BaseEnvironment } from '../environment/base-environment';

@Injectable()
export class ValidationService {
  constructor(private baseEnvironment: BaseEnvironment) {}

  private async _validate<T extends Record<any, any>>(objectOrArray: T | T[]): Promise<ValidationError[]> {
    const isDev = this.baseEnvironment.isDev;
    const array = coerceArray(objectOrArray);
    const errorsNested = await Promise.all(
      array.map(object =>
        validate(object, {
          enableDebugMessages: isDev,
          forbidUnknownValues: true,
          whitelist: true,
          validationError: { target: isDev },
        })
      )
    );
    return formatValidationsErrors(errorsNested.flat());
  }

  private _transform<T extends Record<any, any>>(
    clazz: Class<T>,
    objectOrArray: Record<any, any> | T | Array<Record<any, any> | T>
  ): T | T[] {
    if (isArray(objectOrArray)) {
      return objectOrArray.map(object =>
        object instanceof clazz ? instanceToInstance(object) : plainToInstance(clazz, object)
      );
    }
    return objectOrArray instanceof clazz ? instanceToInstance(objectOrArray) : plainToInstance(clazz, objectOrArray);
  }

  async validate<T extends Record<any, any>>(
    clazz: Class<T>,
    object: Record<any, any> | T
  ): Promise<[T, ValidationError[]]>;
  async validate<T extends Record<any, any>>(
    clazz: Class<T>,
    array: Array<Record<any, any> | T>
  ): Promise<[T[], ValidationError[]]>;
  async validate<T extends Record<any, any>>(
    clazz: Class<T>,
    objectOrArray: Record<any, any> | T | Array<Record<any, any> | T>
  ): Promise<[T | T[], ValidationError[]]> {
    const instanceOrInstances = this._transform(clazz, objectOrArray);
    const errors = await this._validate(instanceOrInstances);
    return [instanceOrInstances, errors];
  }
}
