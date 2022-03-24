export class SwaggerSchemaPropertyMetadata {
  constructor(public propertyKey: string) {}

  type: any;
  required = false;
  maximum?: number;
  minimum?: number;
  maxLength?: number;
  minLength?: number;
  pattern?: string;
}
