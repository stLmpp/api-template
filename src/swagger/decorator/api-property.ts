import { swaggerSchemasMetadata } from '../swagger-schemas.metadata';
import { ReflectMetadataTypes } from '../../utils/reflect';

export interface ApiPropertyOptions {
  type?: any;
  required?: boolean;
}

// TODO maybe use this as a global metadata storage to use in future things (like mapper)

export function ApiProperty(options?: ApiPropertyOptions): PropertyDecorator {
  return (target, propertyKey) => {
    swaggerSchemasMetadata.upsertProperty(target.constructor, propertyKey.toString(), metadata => {
      metadata.type = options?.type ?? Reflect.getMetadata(ReflectMetadataTypes.designType, target, propertyKey);
      metadata.required = options?.required ?? true;
      metadata.propertyKey = propertyKey.toString();
      return metadata;
    });
  };
}
