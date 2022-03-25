import { OpenAPIV3 } from 'openapi-types';

import { ReflectMetadataTypes } from '../utils/reflect';

import { swaggerSchemasMetadata } from './schemas.metadata';
import { isFunction, isNotNil } from 'st-utils';
import { Type } from 'class-transformer';
import { IsDefined, Matches, Max, MaxLength, Min, MinLength } from 'class-validator';

export interface ApiPropertyOptions {
  type?: OpenAPIV3.NonArraySchemaObjectType | OpenAPIV3.ArraySchemaObjectType | (() => any);
  required?: boolean;
  maximum?: number;
  minimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  example?: any;
  description?: string;
}

const fromOpenapiToClassValidator = new Map<keyof ApiPropertyOptions, (...args: any[]) => PropertyDecorator>()
  .set('maximum', Max)
  .set('minimum', Min)
  .set('maxLength', MaxLength)
  .set('minLength', MinLength)
  .set('pattern', Matches);

export function Property(propertyOptions?: ApiPropertyOptions): PropertyDecorator {
  const options: ApiPropertyOptions = { ...propertyOptions };
  return (target, propertyKey) => {
    swaggerSchemasMetadata.upsertProperty(target.constructor, propertyKey.toString(), metadata => {
      const typeReflect = Reflect.getMetadata(ReflectMetadataTypes.designType, target, propertyKey);
      metadata.type = options.type ?? (() => typeReflect);
      metadata.required = options.required ?? true;
      metadata.propertyKey = propertyKey.toString();
      metadata.maximum = options.maximum;
      metadata.minimum = options.minimum;
      metadata.maxLength = options.maxLength;
      metadata.minLength = options.minLength;
      metadata.pattern = options.pattern;
      metadata.example = options.example;
      metadata.description = options.description;
      for (const [key, decorator] of fromOpenapiToClassValidator) {
        if (isNotNil(options[key])) {
          decorator(options[key])(target, propertyKey);
        }
      }
      if (metadata.required) {
        IsDefined()(target, propertyKey);
      }
      if (isFunction(options.type)) {
        Type(options.type)(target, propertyKey);
      }
      return metadata;
    });
  };
}
