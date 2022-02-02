import { SwaggerSchemaPropertyMetadata } from './schema-property.metadata';

export class SwaggerSchemaMetadata {
  constructor(public target: any) {}

  properties = new Map<string, SwaggerSchemaPropertyMetadata>();
}
