import { join } from 'path';

import { LIB_NAME } from '../constants/constants';
import { Injectable } from '../injector/injectable.decorator';

@Injectable()
export class PathUtils {
  joinRootApp(...paths: string[]): string {
    return join(this.getRootApp(), ...paths);
  }

  joinRootLib(...paths: string[]): string {
    return join(this.getRootLib(), ...paths);
  }

  getRootApp(): string {
    return process.cwd();
  }

  getRootLib(): string {
    return join(process.cwd(), 'node_modules', LIB_NAME);
  }
}
