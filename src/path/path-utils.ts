import { join } from 'path';

import { LIB_NAME } from '../constants/constants';
import { BaseEnvironment } from '../environment/base-environment';
import { Injectable } from '../injector/injectable.decorator';

@Injectable()
export class PathUtils {
  constructor(private readonly baseEnvironment: BaseEnvironment) {}

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
    if (this.baseEnvironment.stApiEnv) {
      return this.getRootApp();
    }
    return join(process.cwd(), 'node_modules', LIB_NAME);
  }
}
