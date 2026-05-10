import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import { translation, translationKo } from '../locales';

const i18nClient = i18n.use(LanguageDetector);

i18nClient.init({
	load: 'all',
	whitelist: ['en', 'en-US', 'ko', 'ko-KR'],
	nonExplicitWhitelist: false,
	lngs: ['en-US', 'ko-KR'],
	fallbackLng: 'en-US',
	interpolation: {
		escapeValue: false,
	},
	react: {
		wait: true,
		nsMode: 'default',
	},
	defaultNS: 'locale.constant',
	resources: {
		en: {
			'locale.constant': translation,
		},
		'en-US': {
			'locale.constant': translation,
		},
		ko: {
			'locale.constant': translationKo,
		},
		'ko-KR': {
			'locale.constant': translationKo,
		},
	},
} as any);

export default () => i18nClient;
