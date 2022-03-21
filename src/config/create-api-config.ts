import { ApiConfig } from './api-config';

export function createApiConfig(options?: ApiConfig): ApiConfig {
  return {
    ...options,
  };
}
