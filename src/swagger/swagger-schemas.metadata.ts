export class SwaggerSchemaPropertyMetadata {
  constructor(public propertyKey: string) {}

  type: any;
  required = false;
}

export class SwaggerSchemaMetadata {
  constructor(public target: any) {}

  properties = new Map<string, SwaggerSchemaPropertyMetadata>();
}

export class SwaggerSchemasMetadata {
  private readonly _schemas = new Map<any, SwaggerSchemaMetadata>();

  upsert(target: any, update: (metadata: SwaggerSchemaMetadata) => SwaggerSchemaMetadata): this {
    const metadata = this._schemas.get(target) ?? new SwaggerSchemaMetadata(target);
    this._schemas.set(target, update(metadata));
    return this;
  }

  upsertProperty(
    target: any,
    propertyKey: string,
    update: (metadata: SwaggerSchemaPropertyMetadata) => SwaggerSchemaPropertyMetadata
  ): this {
    return this.upsert(target, schemaMetadata => {
      const metadata = schemaMetadata.properties.get(propertyKey) ?? new SwaggerSchemaPropertyMetadata(propertyKey);
      schemaMetadata.properties.set(propertyKey, update(metadata));
      return schemaMetadata;
    });
  }
}

export const swaggerSchemasMetadata = new SwaggerSchemasMetadata();
