import 'reflect-metadata';
import { generateI18n } from '../src/i18n/generate-i18n';
import { injector } from '../src/injector/injector';
import { PathUtils } from '../src/path/path-utils';

const pathUtils = injector.get(PathUtils);

generateI18n({
  appPath: pathUtils.joinRootApp('src/i18n'),
  libPath: pathUtils.joinRootLib('src/i18n'),
  filename: 'i18n.json',
  defaultLanguage: undefined,
}).then();
