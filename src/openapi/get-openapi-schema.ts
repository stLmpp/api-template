import { OpenAPIV3 } from 'openapi-types';
import { isFunction, isString } from 'st-utils';

import { swaggerSchemasMetadata } from '../schema-metadata/schemas.metadata';

import { getOpenapiPrimitiveType } from './get-openapi-primitive-type';

const cachedSchemas = new Map<any, OpenAPIV3.SchemaObject>();

export function getOpenapiSchema(type: any): OpenAPIV3.SchemaObject {
  if (cachedSchemas.has(type)) {
    return cachedSchemas.get(type)!;
  }
  if (isString(type)) {
    return { type: type as any };
  }
  const [isPrimitive, primitiveType] = getOpenapiPrimitiveType(type);
  if (isPrimitive) {
    return { type: primitiveType };
  }
  const schema: OpenAPIV3.SchemaObject = { type: 'object', required: [] };
  const metadata = swaggerSchemasMetadata.get(type);
  if (metadata) {
    const properties: Record<string, OpenAPIV3.SchemaObject> = {};
    for (const [propertyKey, propertyMetadata] of metadata.properties) {
      const propertyType = isFunction(propertyMetadata.type) ? propertyMetadata.type() : propertyMetadata.type;
      properties[propertyKey] = {
        ...getOpenapiSchema(propertyType),
        maximum: propertyMetadata.maximum,
        minimum: propertyMetadata.minimum,
        maxLength: propertyMetadata.maxLength,
        minLength: propertyMetadata.minLength,
        pattern: propertyMetadata.pattern,
        example: propertyMetadata.example,
        description: propertyMetadata.description,
      };
      if (propertyMetadata.required) {
        schema.required!.push(propertyKey);
      }
    }
    schema.properties = properties;
    cachedSchemas.set(type, schema);
  }
  return schema;
}
