import { OpenAPIV3 } from 'openapi-types';
import { SetRequired } from 'type-fest';

import { controllerMetadataStore } from '../controller/controller.metadata';
import { ParameterType, ParamMetadata } from '../controller/param.metadata';

import { getOpenapiSchema } from './get-openapi-schema';
import { getOpenapiSchemaRef } from './get-openapi-schema-ref';

const fromParameterTypeToParameterIn: Record<ParameterType, string> = {
  params: 'path',
  query: 'query',
  body: '',
  headers: '',
};

function assertName(param: ParamMetadata): param is SetRequired<ParamMetadata, 'name'> {
  return !!param.name;
}

export function getOpenapiEndPointSchema(type: any, method: string): OpenAPIV3.PathItemObject | undefined {
  const controllerMetadata = controllerMetadataStore.get(type);
  if (!controllerMetadata) {
    return undefined;
  }
  const routeMetadata = controllerMetadata.routes.get(method as string);
  if (!routeMetadata) {
    return undefined;
  }
  const operationObject: OpenAPIV3.OperationObject = {
    tags: [type.name],
    parameters: routeMetadata.params
      .filter(assertName)
      .filter(({ parameterType }) => parameterType === 'params' || parameterType === 'query')
      .map(param => ({
        in: fromParameterTypeToParameterIn[param.parameterType],
        name: param.name,
        schema: getOpenapiSchema(param.type),
      })),
    responses: {
      [routeMetadata.httpCode]: {
        description: 'OK',
        content: {
          'application/json': {
            schema: getOpenapiSchemaRef(routeMetadata.responseType),
          },
        },
      },
    },
  };
  if (routeMetadata.bodyType) {
    operationObject.requestBody = {
      content: {
        'application/json': {
          schema: getOpenapiSchemaRef(routeMetadata.bodyType),
        },
      },
    };
  }
  return {
    [routeMetadata.method]: operationObject,
  };
}
