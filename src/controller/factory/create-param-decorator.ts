import { controllerMetadataStore } from '../controller.metadata';
import { ReflectMetadataTypes } from '../../utils/reflect';
import { parseParam } from '../parse-param';
import { ParamDecoratorType } from '../param-decorator.type';

export function createParamDecorator(from: 'params' | 'query'): ParamDecoratorType {
  return param => (target, propertyKey, parameterIndex) => {
    controllerMetadataStore.upsertRoute(target.constructor, propertyKey.toString(), metadata => {
      const type = (Reflect.getMetadata(ReflectMetadataTypes.paramTypes, target, propertyKey) ?? [])[parameterIndex];
      metadata.params[parameterIndex] = request => parseParam(request[from], param, type);
      return metadata;
    });
  };
}
