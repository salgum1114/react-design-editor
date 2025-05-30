import { LocaleProvider } from 'antd';
import enUS from 'antd/lib/locale-provider/en_US';
import koKR from 'antd/lib/locale-provider/ko_KR';
import i18next from 'i18next';
import React from 'react';
import ReactDom from 'react-dom';
import App from './App';
import { i18nClient } from './i18n';
import { register } from './serviceWorker';

const antResources = {
	ko: koKR,
	'ko-KR': koKR,
	en: enUS,
	'en-US': enUS,
};

const root = document.createElement('div');
root.id = 'root';
document.body.appendChild(root);

const rootElement = document.getElementById('root');

const render = (Component: React.ElementType) => {
	ReactDom.render(
		<LocaleProvider locale={antResources[i18next.language]}>
			<Component />
		</LocaleProvider>,
		rootElement,
	);
};

i18nClient();

render(App);

register();
