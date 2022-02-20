import { RequestHandler } from 'express';
import { I18nLanguage } from './i18n-language.enum';
import { createI18nContext } from './i18n-async-hook';
import camelcase from 'camelcase';

export interface I18NMiddlewareOptions {
  defaultLanguage: I18nLanguage | undefined;
}

function parseAcceptLanguageHeader(header: string): I18nLanguage | null {
  const language = header.split(',').filter(_language => !_language.includes(';'))[0];
  if (language) {
    return I18nLanguage[camelcase(language) as keyof typeof I18nLanguage] ?? null;
  }
  return null;
}

export function i18nMiddleware(options: I18NMiddlewareOptions): RequestHandler {
  return (req, res, next) => {
    const defaultLanguage = options.defaultLanguage ?? ('en-US' as I18nLanguage);
    const header = req.headers['accept-language'];
    const language = !header || header === '*' ? defaultLanguage : parseAcceptLanguageHeader(header) ?? defaultLanguage;
    createI18nContext(language);
    next();
  };
}
