import { join } from 'path';

import { pathExists } from './path-exists';

describe('path-exists', () => {
  it('should return true if path exists', async () => {
    const path = join(process.cwd(), 'src', 'utils', 'path-exists.ts');
    const exists = await pathExists(path);
    expect(exists).toBe(true);
  });

  it('should return false if path does not exists', async () => {
    const path = join(process.cwd(), 'not-exists-for-sure-i-will-never-create-this-folder');
    const exists = await pathExists(path);
    expect(exists).toBe(false);
  });
});
