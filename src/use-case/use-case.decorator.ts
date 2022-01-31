import { Injectable } from '../injector/injectable.decorator';

export function UseCase(): ClassDecorator {
  return Injectable();
}
