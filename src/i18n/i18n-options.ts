import { I18nLanguage } from './i18n-language.enum';

export interface I18nOptions {
  path: string;
  filename: string;
  defaultLanguage: I18nLanguage | undefined;
}
