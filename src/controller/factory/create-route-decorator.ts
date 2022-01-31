import { HTTPMethod } from '../../enum/http-method.enum';
import { controllerMetadataStore } from '../controller.metadata';
import { RouteDecoratorType } from '../route-decorator.type';

export function createRouteDecorator(method: HTTPMethod): RouteDecoratorType {
  return path => (target, propertyKey) => {
    controllerMetadataStore.upsertRoute(target.constructor, propertyKey.toString(), metadata => {
      if (path) {
        metadata.path = path;
      }
      metadata.method = method;
      return metadata;
    });
  };
}
