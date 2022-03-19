import { ReflectMetadataTypes } from '../../utils/reflect';
import { controllerMetadataStore } from '../controller.metadata';
import { ParamDecoratorType } from '../param-decorator.type';
import { parseParam } from '../parse-param';

export function createParamDecorator(from: 'params' | 'query'): ParamDecoratorType {
  return param => (target, propertyKey, parameterIndex) => {
    controllerMetadataStore.upsertParam(target.constructor, propertyKey.toString(), parameterIndex, metadata => {
      const type = (Reflect.getMetadata(ReflectMetadataTypes.paramTypes, target, propertyKey) ?? [])[parameterIndex];
      metadata.type = type;
      metadata.parser = request => parseParam(request[from], param, type);
      return metadata;
    });
  };
}
