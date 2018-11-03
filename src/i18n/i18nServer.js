import i18n from 'i18next';
import XHR from 'i18next-xhr-backend';
import LanguageDetector from 'i18next-browser-languagedetector';

/**
 * Server Side Load
 */
const i18nServer = i18n
    .use(XHR)
    .use(LanguageDetector)
    .init({
        load: 'all',
        whitelist: ['en-US', 'ko-KR', 'ru-RU', 'zh-CN', 'es-ES'],
        nonExplicitWhitelist: false,
        lngs: ['en-US', 'ko-KR', 'ru-RU', 'zh-CN', 'es-ES'],
        backend: {
            // for all available options read the backend's repository readme file
            loadPath: '/locales/{{lng}}/{{ns}}.json',
        },
        fallbackLng: 'en-US',
        interpolation: {
            escapeValue: false, // not needed for react!!
        },
        react: {
            wait: true, // set to true if you like to wait for loaded in every translated hoc
            nsMode: 'default', // set it to fallback to let passed namespaces to translated hoc act as fallbacks
        },
        defaultNS: 'locale.constant',
        ns: [
            'locale.constant',
        ],
    });

export default i18nServer;
