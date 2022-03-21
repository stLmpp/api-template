import { I18nOptions } from '../i18n/i18n-options';

export interface ApiConfig {
  name?: string;
  prefix?: string;
  port?: number;
  host?: string;
  i18nOptions?: Partial<I18nOptions>;
  mainFile?: string;
}
