import { I18nLanguage } from './i18n-language.enum';

export interface I18nOptionsInternal {
  appPath: string;
  libPath: string;
  filename: string;
  defaultLanguage: I18nLanguage | undefined;
}
