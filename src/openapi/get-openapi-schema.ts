import { OpenAPIV3 } from 'openapi-types';

import { swaggerSchemasMetadata } from '../schema-metadata/schemas.metadata';

import { getOpenapiPrimitiveType } from './get-openapi-primitive-type';

const cachedSchemas = new Map<any, OpenAPIV3.SchemaObject>();

export function getOpenapiSchema(type: any): OpenAPIV3.SchemaObject {
  if (cachedSchemas.has(type)) {
    return cachedSchemas.get(type)!;
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
      properties[propertyKey] = getOpenapiSchema(propertyMetadata.type);
      properties[propertyKey].maximum = propertyMetadata.maximum;
      properties[propertyKey].minimum = propertyMetadata.minimum;
      properties[propertyKey].maxLength = propertyMetadata.maxLength;
      properties[propertyKey].minLength = propertyMetadata.minLength;
      properties[propertyKey].pattern = propertyMetadata.pattern;
      if (propertyMetadata.required) {
        schema.required!.push(propertyKey);
      }
    }
    schema.properties = properties;
    cachedSchemas.set(type, schema);
  }
  return schema;
}
