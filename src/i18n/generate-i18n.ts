import { readFile, writeFile } from 'fs/promises';
import { join } from 'path';

import camelcase from 'camelcase';

import { applyPrettier } from '../prettier/apply-prettier';

import { I18nMessagesObject } from './i18n-messages-object';
import { I18nOptionsInternal } from './i18n-options-internal';

export async function generateI18n({ appPath, filename, libPath }: I18nOptionsInternal): Promise<void> {
  const fileBuffer = await readFile(join(appPath, filename));
  const messagesObject: I18nMessagesObject = JSON.parse(fileBuffer.toString());
  const keys = Object.keys(messagesObject);
  const typeString = `export enum I18nKey {${keys.map(key => `${camelcase(key)}='${key}'`).join(',')}}`;
  await createFile(join(libPath, 'i18n-key.enum.ts'), typeString);
  const languages = getLanguages(messagesObject);
  const languageTypeString = `export enum I18nLanguage {${languages
    .map(key => `${camelcase(key)}='${key}'`)
    .join(',')}}`;
  await createFile(join(libPath, 'i18n-language.enum.ts'), languageTypeString);
  const messagesObjectString = `import { I18nMessagesObject } from './i18n-messages-object';\n\nconst i18nMessages: I18nMessagesObject = ${fileBuffer.toString()};\n\n\nexport default i18nMessages;`;
  await createFile(join(libPath, 'i18n-messages.ts'), messagesObjectString);
}

async function createFile(filePath: string, fileContent: string): Promise<void> {
  await writeFile(
    filePath,
    await applyPrettier(`// *********** FILE AUTO GENERATED, DO NOT CHANGE.\n\n\n${fileContent}`)
  );
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
