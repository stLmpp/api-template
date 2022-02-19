import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { I18nMessagesObject } from './i18n-messages-object';
import { applyPrettier } from '../prettier/apply-prettier';

export interface I18nOptions {
  path?: string;
  filename?: string;
}

export async function generateI18n(options: I18nOptions = {}): Promise<void> {
  const path = join(process.cwd(), options.path ?? 'src/i18n');
  const fileBuffer = await readFile(join(path, options.filename ?? 'i18n.json'));
  const messagesObject: I18nMessagesObject = JSON.parse(fileBuffer.toString());
  const keys = Object.keys(messagesObject);
  const typeString = `export type I18nKey = ${keys.map(key => `'${key}'`).join(' | ')}`;
  await writeFile(join(path, 'i18n-key.type.ts'), await applyPrettier(typeString));
  const languages = getLanguages(messagesObject);
  const languageTypeString = `export type I18nLanguage = ${languages.map(key => `'${key}'`).join(' | ')}`;
  await writeFile(join(path, 'i18n-language.type.ts'), await applyPrettier(languageTypeString));
  const messagesObjectString = `import { I18nMessagesObject } from './i18n-messages-object';\n\nconst i18nMessages: I18nMessagesObject = ${fileBuffer.toString()};\n\nexport default i18nMessages;`;
  await writeFile(join(path, 'i18n-messages.ts'), await applyPrettier(messagesObjectString));
}

function getLanguages(messagesObject: I18nMessagesObject): string[] {
  const values = Object.values(messagesObject);
  const languages = new Set<string>();
  for (const value of values) {
    const keys = Object.keys(value);
    for (const key of keys) {
      languages.add(key);
    }
  }
  return [...languages];
}
