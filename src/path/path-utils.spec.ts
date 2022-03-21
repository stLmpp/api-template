import { LIB_NAME } from '../constants/constants';
import { getMockBaseEnvironment } from '../environment/base-environment.mock';

import { PathUtils } from './path-utils';

describe('PathUtils', () => {
  let pathUtils: PathUtils;
  const mockBaseEnvironment = getMockBaseEnvironment();
  const root = 'ROOT' as const;
  jest.spyOn(process, 'cwd').mockReturnValue(root);

  beforeEach(() => {
    pathUtils = new PathUtils(mockBaseEnvironment);
    mockBaseEnvironment.stApiEnv = true;
  });

  it('should get root from app', () => {
    const path = pathUtils.getRootApp();
    expect(path).toBe(root);
  });

  it('should get root from lib', () => {
    const path = pathUtils.getRootLib();
    expect(path).toBe(root);
  });

  it('should get root from lib (not st-api-env)', () => {
    mockBaseEnvironment.stApiEnv = false;
    const path = pathUtils.getRootLib();
    expect(path).toBe(`${root}/node_modules/${LIB_NAME}`);
  });

  it('should join from root app', () => {
    const path = pathUtils.joinRootApp('src');
    expect(path).toBe(`${root}/src`);
  });

  it('should join from root lib', () => {
    const path = pathUtils.joinRootLib('src');
    expect(path).toBe(`${root}/src`);
  });

  it('should join from root lib (not st-api-env)', () => {
    mockBaseEnvironment.stApiEnv = false;
    const path = pathUtils.joinRootLib('src');
    expect(path).toBe(`${root}/node_modules/${LIB_NAME}/src`);
  });
});
