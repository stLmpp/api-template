import { createHook, executionAsyncId } from 'async_hooks';
import { I18nLanguage } from './i18n-language.enum';

const store = new Map<number, I18nLanguage>();

const i18nAsyncHook = createHook({
  destroy: (asyncId: number) => {
    store.delete(asyncId);
  },
});

i18nAsyncHook.enable();

export function createI18nContext(language: I18nLanguage): void {
  store.set(executionAsyncId(), language);
}

export function getI18nContext(): I18nLanguage | undefined {
  return store.get(executionAsyncId());
}
