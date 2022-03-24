import { OpenAPIV3 } from 'openapi-types';

import { controllerMetadataStore } from '../controller/controller.metadata';
import { swaggerSchemasMetadata } from '../schema-metadata/schemas.metadata';

import { getOpenapiControllerPaths } from './get-openapi-controller-paths';
import { getOpenapiSchema } from './get-openapi-schema';

export function getOpenapiDocument(): OpenAPIV3.Document {
  const document: OpenAPIV3.Document = {
    openapi: '3.0.0',
    paths: {},
    info: {
      title: 'API',
      version: '1.0.0',
    },
    components: {
      schemas: {},
    },
  };

  const entriesSchemas = swaggerSchemasMetadata.entries();

  for (const [schemaType] of entriesSchemas) {
    document.components!.schemas![schemaType.name] = getOpenapiSchema(schemaType);
  }

  const entriesControllers = controllerMetadataStore.entries();

  for (const [controllerType] of entriesControllers) {
    document.paths = {
      ...document.paths,
      ...getOpenapiControllerPaths(controllerType),
    };
  }

  return document;
}
