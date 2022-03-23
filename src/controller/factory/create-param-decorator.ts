import { ReflectMetadataTypes } from '../../utils/reflect';
import { controllerMetadataStore } from '../controller.metadata';
import { ParamDecoratorType } from '../param-decorator.type';
import { parseParam } from '../parse-param';

export function createParamDecorator(from: 'params' | 'query' | 'body' | 'headers'): ParamDecoratorType {
  return param => (target, propertyKey, parameterIndex) => {
    const type = (Reflect.getMetadata(ReflectMetadataTypes.paramTypes, target, propertyKey) ?? [])[parameterIndex];
    if (type && from === 'body') {
      controllerMetadataStore.upsertRoute(target.constructor, propertyKey.toString(), metadata => {
        metadata.bodyType = type;
        return metadata;
      });
    }
    controllerMetadataStore.upsertParam(target.constructor, propertyKey.toString(), parameterIndex, metadata => {
      metadata.type = type;
      metadata.parser = request => parseParam(request[from], param, type);
      return metadata;
    });
  };
}
