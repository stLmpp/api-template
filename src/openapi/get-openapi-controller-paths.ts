import { OpenAPIV3 } from 'openapi-types';

import { controllerMetadataStore } from '../controller/controller.metadata';

import { getOpenapiEndPointPath } from './get-openapi-end-point-path';
import { getOpenapiEndPointSchema } from './get-openapi-end-point-schema';

export function getOpenapiControllerPaths(type: any): OpenAPIV3.PathsObject | undefined {
  const metadata = controllerMetadataStore.get(type);
  if (!metadata) {
    return undefined;
  }
  const pathsObject: OpenAPIV3.PathsObject = {};
  for (const [routeKey] of metadata.routes) {
    const endPoint = getOpenapiEndPointPath(type, routeKey);
    if (!endPoint) {
      continue;
    }
    pathsObject[endPoint] = {
      ...pathsObject[endPoint],
      ...getOpenapiEndPointSchema(type, routeKey),
    };
  }
  return pathsObject;
}
