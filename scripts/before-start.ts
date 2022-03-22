import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import { pathExists } from '../src/utils/path-exists';

async function checkForEnv(): Promise<void> {
  const pathEnv = join(process.cwd(), '.env');
  const envExists = await pathExists(pathEnv);
  if (!envExists) {
    const envExample = await readFile(join(process.cwd(), '.env-EXAMPLE'));
    await writeFile(pathEnv, envExample);
  }
}

(async () => {
  await Promise.all([checkForEnv()]);
})();
