import { OpenAPIV3 } from 'openapi-types';

import { getOpenapiPrimitiveType } from './get-openapi-primitive-type';

export function getOpenapiSchemaRef(type: any): OpenAPIV3.SchemaObject | OpenAPIV3.ReferenceObject {
  const [isPrimitive, primitiveType] = getOpenapiPrimitiveType(type);
  if (isPrimitive) {
    return { type: primitiveType };
  }
  if (!type.name) {
    throw new Error(`Cannot get schema ref for ${Function.prototype.toString.call(type)}`);
  }
  return { $ref: `#/components/schemas/${type.name}` };
}
