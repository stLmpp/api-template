import { format, resolveConfig } from 'prettier';

export async function applyPrettier(file: string): Promise<string> {
  const prettierrc = await resolveConfig(process.cwd());
  return format(file, { ...prettierrc, parser: 'babel' });
}
