import { join } from 'path';
import { readFile, writeFile } from 'fs/promises';
import { I18nMessagesObject } from './i18n-messages-object';
import { applyPrettier } from '../prettier/apply-prettier';
import camelcase from 'camelcase';
import { I18nOptions } from './i18n-options';

export async function generateI18n(options: I18nOptions = {}): Promise<void> {
  const path = join(process.cwd(), options.path ?? 'src/i18n');
  const fileBuffer = await readFile(join(path, options.filename ?? 'i18n.json'));
  const messagesObject: I18nMessagesObject = JSON.parse(fileBuffer.toString());
  const keys = Object.keys(messagesObject);
  const typeString = `export enum I18nKey {${keys.map(key => `'${camelcase(key)}'='${key}'`).join(',')}}`;
  await writeFile(join(path, 'i18n-key.enum.ts'), await applyPrettier(typeString));
  const languages = getLanguages(messagesObject);
  const languageTypeString = `export enum I18nLanguage {${languages
    .map(key => `'${camelcase(key)}'='${key}'`)
    .join(',')}}`;
  await writeFile(join(path, 'i18n-language.enum.ts'), await applyPrettier(languageTypeString));
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
