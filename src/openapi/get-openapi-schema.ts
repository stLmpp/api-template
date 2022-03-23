import { OpenAPIV3 } from 'openapi-types';

import { swaggerSchemasMetadata } from '../schema-metadata/schemas.metadata';

const cachedSchemas = new Map<any, OpenAPIV3.SchemaObject>();

const mapType = new Map<any, OpenAPIV3.NonArraySchemaObjectType>([
  [Number, 'number'],
  [String, 'string'],
  [Boolean, 'boolean'],
]);

export function getOpenapiSchema(type: any): OpenAPIV3.SchemaObject {
  if (cachedSchemas.has(type)) {
    return cachedSchemas.get(type)!;
  }
  if (mapType.has(type)) {
    return {
      type: mapType.get(type)!,
    };
  }
  const schema: OpenAPIV3.SchemaObject = {
    type: 'object',
  };
  const metadata = swaggerSchemasMetadata.get(type);
  if (metadata) {
    const properties: Record<string, OpenAPIV3.SchemaObject> = {};
    for (const [propertyKey, propertyMetadata] of metadata.properties) {
      properties[propertyKey] = getOpenapiSchema(propertyMetadata.type);
    }
    schema.properties = properties;
    cachedSchemas.set(type, schema);
  }
  return schema;
}
