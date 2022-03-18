import { environmentMetadata, EnvPropertyMetadata } from './environment.metadata';
import { isString } from 'st-utils';
import { ReflectMetadataTypes } from '../utils/reflect';
import { snakeCase } from 'snake-case';

export interface EnvPropertyOptions {
  required?: boolean;
  name?: string;
  parser?: (value: any) => any;
}

const defaultParserMap = new Map<any, (value: any) => any>([
  [Number, value => Number(value)],
  [Boolean, value => (isString(value) ? value === 'true' : !!value)],
]);

export function EnvProp(options?: EnvPropertyOptions): PropertyDecorator {
  return (target, _propertyKey) => {
    const propertyKey = _propertyKey.toString();
    const name = snakeCase(options?.name ?? propertyKey).toUpperCase();
    const parser =
      options?.parser ??
      defaultParserMap.get(Reflect.getMetadata(ReflectMetadataTypes.designType, target, _propertyKey));
    environmentMetadata.add(propertyKey, new EnvPropertyMetadata(propertyKey, name, options?.required ?? true, parser));
  };
}
