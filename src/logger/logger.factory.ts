import { isString } from 'st-utils';
import { Class } from 'type-fest';

import { Injectable } from '../injector/injectable.decorator';

import { Logger } from './logger';

@Injectable()
export class LoggerFactory {
  create(nameOrClassOrInstance: string | Class<any> | Record<any, any>): Logger {
    let name: string;
    if (isString(nameOrClassOrInstance)) {
      name = nameOrClassOrInstance;
    } else if (nameOrClassOrInstance.name) {
      name = nameOrClassOrInstance.name;
    } else {
      const constructorName = Object.getPrototypeOf(nameOrClassOrInstance)?.constructor?.name;
      if (!constructorName) {
        throw new Error('Could not create logger');
      }
      name = constructorName;
    }
    return Logger.create(name);
  }
}
