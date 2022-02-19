import { I18nKey } from './i18n-key.type';
import i18nMessages from './i18n-messages';
import { I18nLanguage } from './i18n-language.type';
import { ApplicationError } from '../error/application-error';
import { StatusCodes } from 'http-status-codes';
import { injector } from '../injector/injector';

export class I18nService {
  private _language = 'en-US';

  get(key: I18nKey, params?: Record<string, string>): string {
    const messageObject = i18nMessages[key];
    if (!messageObject) {
      throw new ApplicationError({
        error: `Message with key "${key}" not found`,
        message: `Message with key "${key}" not found`,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    let message = messageObject[this._language];
    if (!message) {
      throw new ApplicationError({
        error: `Message with key "${key}" and language "${this._language}" not found`,
        message: `Message with key "${key}" and language "${this._language}" not found`,
        statusCode: StatusCodes.INTERNAL_SERVER_ERROR,
      });
    }
    if (params) {
      for (const [param, paramValue] of Object.entries(params)) {
        message = message.replace(new RegExp(`{${param}}`, 'g'), paramValue);
      }
    }
    return message;
  }

  setLanguage(language: I18nLanguage): void {
    // TODO add middleware and async_hook to set the language of the i18nService (maybe get the language via async_hook, Idk)
    this._language = language;
  }
}

export const i18nService = new I18nService();

injector.set(I18nService, i18nService);
