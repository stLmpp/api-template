import { Class } from 'type-fest';
import { RouteMetadata } from './route.metadata';

export class ControllerMetadata {
  constructor(path?: string) {
    this.path = path ?? '/';
    this.routes = new Map();
  }

  path: string;
  routes: Map<string, RouteMetadata>;
}

export class ControllerMetadataStore {
  private readonly _metadata = new Map<any, ControllerMetadata>();

  upsert(target: any, update: (metadata: ControllerMetadata) => ControllerMetadata): this {
    const metadata = this._metadata.get(target) ?? new ControllerMetadata();
    this._metadata.set(target, update(metadata));
    return this;
  }

  upsertRoute(target: any, route: string, update: (metadata: RouteMetadata) => RouteMetadata): this {
    return this.upsert(target, controllerMetadata => {
      const metadata = controllerMetadata.routes.get(route) ?? new RouteMetadata();
      controllerMetadata.routes.set(route, update(metadata));
      return controllerMetadata;
    });
  }

  getEntries(): [Class<any>, ControllerMetadata][] {
    return [...this._metadata.entries()];
  }
}

export const controllerMetadataStore = new ControllerMetadataStore();
