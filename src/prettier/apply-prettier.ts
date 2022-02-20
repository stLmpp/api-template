import { BuiltInParserName, CustomParser, format, LiteralUnion, resolveConfig } from 'prettier';

export async function applyPrettier(
  file: string,
  parser: LiteralUnion<BuiltInParserName> | CustomParser = 'typescript'
): Promise<string> {
  const prettierrc = await resolveConfig(process.cwd());
  return format(file, { ...prettierrc, parser });
}
