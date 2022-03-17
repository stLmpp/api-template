import { applyPrettier } from './apply-prettier';

describe('applyPrettier', () => {
  it('should apply prettier', async () => {
    const ts = `import {join } from   'path';
    
const  path = join(
'src', 
"index.ts")`;
    const expectedTs = `import { join } from 'path';

const path = join('src', 'index.ts');
`;
    const tsPretty = await applyPrettier(ts);
    expect(tsPretty).toBe(expectedTs);
  });
});
