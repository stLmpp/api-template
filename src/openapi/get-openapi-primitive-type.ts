import { OpenAPIV3 } from 'openapi-types';

const mapType = new Map<any, OpenAPIV3.NonArraySchemaObjectType>([
  [Number, 'number'],
  [String, 'string'],
  [Boolean, 'boolean'],
]);

export function getOpenapiPrimitiveType(type: any): [primitive: true, type: OpenAPIV3.NonArraySchemaObjectType];
export function getOpenapiPrimitiveType(type: any): [primitive: false];
export function getOpenapiPrimitiveType(type: any): [primitive: boolean, type?: OpenAPIV3.NonArraySchemaObjectType] {
  const primitive = mapType.get(type);
  return [!!primitive, primitive];
}
