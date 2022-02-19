import { I18nKey } from './i18n-key.enum';
import i18nMessages from './i18n-messages';
import { ApplicationError } from '../error/application-error';
import { StatusCodes } from 'http-status-codes';
import { injector } from '../injector/injector';
import { getI18nContext } from './i18n-async-hook';
import { I18nLanguage } from './i18n-language.enum';

export class I18nService {
  get(key: I18nKey, params?: Record<string, string>): string {
    const messageObject = i18nMessages[key];
    if (!messageObject) {
      throw new ApplicationError({
        error: `Message with key "${key}" not found`,
        message: `Message with key "${key}" not found`,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    let language = getI18nContext();
    if (!language) {
      language = Object.values(I18nLanguage)[0];
    }
    let message = messageObject[language];
    if (!message) {
      for (const i18nLanguage of Object.values(I18nLanguage)) {
        if (messageObject[i18nLanguage]) {
          message = messageObject[i18nLanguage];
        }
      }
    }
    if (params) {
      for (const [param, paramValue] of Object.entries(params)) {
        message = message.replace(new RegExp(`{${param}}`, 'g'), paramValue);
      }
    }
    return message;
  }
}

export const i18nService = new I18nService();

injector.set(I18nService, i18nService);
