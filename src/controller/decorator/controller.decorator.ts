import { isNil, isString } from 'st-utils';

import { Injectable } from '../../injector/injectable.decorator';
import { ControllerOptions } from '../controller-options';
import { controllerMetadataStore } from '../controller.metadata';

export function Controller(optionsOrPath?: ControllerOptions | string): ClassDecorator {
  const options: ControllerOptions =
    isString(optionsOrPath) || isNil(optionsOrPath) ? { path: optionsOrPath ?? '/' } : optionsOrPath;

  return target => {
    Injectable()(target);
    controllerMetadataStore.upsert(target, metadata => {
      metadata.path = options.path;
      return metadata;
    });
  };
}
