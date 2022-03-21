import { I18nOptionsInternal } from '../i18n/i18n-options-internal';

import { ApiConfig } from './api-config';

export interface ApiConfigInternal extends Omit<Required<ApiConfig>, 'i18nOptions'> {
  i18nOptions: I18nOptionsInternal;
}
