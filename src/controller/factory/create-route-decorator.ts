import { HttpMethod } from '../../http/http-method.enum';
import { controllerMetadataStore } from '../controller.metadata';
import { RouteDecoratorType } from '../route-decorator.type';

export function createRouteDecorator(method: HttpMethod): RouteDecoratorType {
  return options => (target, propertyKey) => {
    controllerMetadataStore.upsertRoute(target.constructor, propertyKey.toString(), metadata => {
      if (options?.path) {
        metadata.path = options.path;
      }
      if (options?.httpCode) {
        metadata.httpCode = options.httpCode;
      }
      if (options?.responseType) {
        metadata.responseType = options.responseType;
      }
      if (options?.bodyType) {
        metadata.bodyType = options.bodyType;
      }
      metadata.method = method;
      return metadata;
    });
  };
}
