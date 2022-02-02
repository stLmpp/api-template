import { HTTPMethod } from '../../enum/http-method.enum';
import { controllerMetadataStore } from '../controller.metadata';
import { RouteDecoratorType } from '../route-decorator.type';
import { ReflectMetadataTypes } from '../../utils/reflect';

export function createRouteDecorator(method: HTTPMethod): RouteDecoratorType {
  return path => (target, propertyKey) => {
    controllerMetadataStore.upsertRoute(target.constructor, propertyKey.toString(), metadata => {
      if (path) {
        metadata.path = path;
      }
      metadata.method = method;
      const returnType = Reflect.getMetadata(ReflectMetadataTypes.returnType, target, propertyKey);
      if (returnType) {
        metadata.returnType = returnType;
      }
      return metadata;
    });
  };
}
