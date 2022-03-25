import { OpenAPIV3 } from 'openapi-types';

export class SwaggerSchemaPropertyMetadata {
  constructor(public propertyKey: string) {}

  type?: OpenAPIV3.NonArraySchemaObjectType | OpenAPIV3.ArraySchemaObjectType | (() => any);
  required = false;
  maximum?: number;
  minimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
  example?: any;
  description?: string;
}
