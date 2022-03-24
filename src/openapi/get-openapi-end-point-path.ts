import { controllerMetadataStore } from '../controller/controller.metadata';
import { PathUtils } from '../path/path-utils';

export function getOpenapiEndPointPath(type: any, method: string): string | undefined {
  const metadata = controllerMetadataStore.get(type);
  if (!metadata) {
    return undefined;
  }
  const routeMetadata = metadata.routes.get(method);
  if (!routeMetadata) {
    return undefined;
  }
  return PathUtils.normalizeEndPoint('/', metadata.path, '/', routeMetadata.path, '/').replace(
    /:(.*?)(?=(\/|$))/g,
    value => `{${value.slice(1)}}`
  );
}
