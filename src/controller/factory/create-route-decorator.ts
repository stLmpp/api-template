import { HttpMethod } from '../../http/http-method.enum';
import { ReflectMetadataTypes } from '../../utils/reflect';
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
      metadata.method = method;
      const returnType = Reflect.getMetadata(ReflectMetadataTypes.returnType, target, propertyKey);
      if (returnType) {
        metadata.returnType = returnType;
      }
      return metadata;
    });
  };
}
