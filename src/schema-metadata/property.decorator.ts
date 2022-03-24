import { OpenAPIV3 } from 'openapi-types';

import { ReflectMetadataTypes } from '../utils/reflect';

import { swaggerSchemasMetadata } from './schemas.metadata';

export interface ApiPropertyOptions {
  type?: OpenAPIV3.NonArraySchemaObjectType | OpenAPIV3.ArraySchemaObjectType;
  required?: boolean;
  maximum?: number;
  minimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  example?: any;
  description?: string;
}

export function Property(options?: ApiPropertyOptions): PropertyDecorator {
  return (target, propertyKey) => {
    swaggerSchemasMetadata.upsertProperty(target.constructor, propertyKey.toString(), metadata => {
      metadata.type = options?.type ?? Reflect.getMetadata(ReflectMetadataTypes.designType, target, propertyKey);
      metadata.required = options?.required ?? true;
      metadata.propertyKey = propertyKey.toString();
      metadata.maximum = options?.maximum;
      metadata.minimum = options?.minimum;
      metadata.maxLength = options?.maxLength;
      metadata.minLength = options?.minLength;
      metadata.pattern = options?.pattern;
      metadata.example = options?.example;
      metadata.description = options?.description;
      return metadata;
    });
  };
}
