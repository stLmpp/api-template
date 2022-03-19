import { mock, MockProxy } from 'jest-mock-extended';

import { BaseEnvironment } from './base-environment';

export function getMockBaseEnvironment(): MockProxy<BaseEnvironment> {
  return mock();
}
