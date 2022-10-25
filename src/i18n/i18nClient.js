import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { translation, translationKo, translationEl } from '../locales';

/**
 * Client Side Load
 */
const i18nClient = i18n
	// .use(XHR)
	.use(LanguageDetector)
	.init({
		load: 'all',
		whitelist: ['en', 'en-US', 'el', 'el-GR'],
		nonExplicitWhitelist: false,
		lngs: ['en-US', 'el'],
		fallbackLng: 'el',
		interpolation: {
			escapeValue: false, // not needed for react!!
		},
		react: {
			wait: true, // set to true if you like to wait for loaded in every translated hoc
			nsMode: 'default', // set it to fallback to let passed namespaces to translated hoc act as fallbacks
		},
		defaultNS: 'locale.constant',
		resources: {
			en: {
				'locale.constant': translation,
			},
			'en-US': {
				'locale.constant': translation,
			},
			el: {
				'locale.constant': translationEl,
			},
			'el-GR': {
				'locale.constant': translationEl,
			},
			ko: {
				'locale.constant': translationKo,
			},
			'ko-KR': {
				'locale.constant': translationKo,
			},
		},
	});

export default () => i18nClient;
