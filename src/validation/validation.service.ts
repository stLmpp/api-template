import { instanceToInstance, plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { coerceArray, isArray } from 'st-utils';
import { Class } from 'type-fest';

import { Injectable } from '../injector/injectable.decorator';

import { formatValidationsErrors } from './format-validation-errors';
import { ValidationError } from './validation-error';

@Injectable()
export class ValidationService {
  private async _validate<T extends Record<any, any>>(objectOrArray: T | T[]): Promise<ValidationError[]> {
    const array = coerceArray(objectOrArray);
    const errorsNested = await Promise.all(
      array.map(object =>
        validate(object, {
          forbidUnknownValues: true,
          whitelist: true,
          validationError: { target: false },
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
    array: Array<Record<any, any> | T>
  ): Promise<[T[], ValidationError[]]>;
  async validate<T extends Record<any, any>>(
    clazz: Class<T>,
    object: Record<any, any> | T
  ): Promise<[T, ValidationError[]]>;
  async validate<T extends Record<any, any>>(
    clazz: Class<T>,
    objectOrArray: Record<any, any> | T | Array<Record<any, any> | T>
  ): Promise<[T | T[], ValidationError[]]> {
    const instanceOrInstances = this._transform(clazz, objectOrArray);
    const errors = await this._validate(instanceOrInstances);
    return [instanceOrInstances, errors];
  }
}
