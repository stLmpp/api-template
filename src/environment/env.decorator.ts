import { Injectable } from '../injector/injectable.decorator';

let hasEnv = false;

export function Env(): ClassDecorator {
  return target => {
    if (hasEnv) {
      throw new Error(`Only one environment class must be defined. Trying to set: ${target.name}`);
    }
    hasEnv = true;
    Injectable()(target);
  };
}
