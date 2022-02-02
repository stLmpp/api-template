import { swaggerSchemasMetadata } from './schemas.metadata';
import { ReflectMetadataTypes } from '../utils/reflect';
import { OpenAPIV3 } from 'openapi-types';

export interface ApiPropertyOptions {
  type?: OpenAPIV3.NonArraySchemaObjectType | OpenAPIV3.ArraySchemaObjectType;
  required?: boolean;
  // TODO add validations here
}

export function Property(options?: ApiPropertyOptions): PropertyDecorator {
  return (target, propertyKey) => {
    swaggerSchemasMetadata.upsertProperty(target.constructor, propertyKey.toString(), metadata => {
      metadata.type = options?.type ?? Reflect.getMetadata(ReflectMetadataTypes.designType, target, propertyKey);
      metadata.required = options?.required ?? true;
      metadata.propertyKey = propertyKey.toString();
      return metadata;
    });
  };
}
