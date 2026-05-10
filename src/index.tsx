import { ConfigProvider } from 'antd';
import enUS from 'antd/locale/en_US';
import koKR from 'antd/locale/ko_KR';
import i18next from 'i18next';
import React from 'react';
import { createRoot } from 'react-dom/client';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import { i18nClient } from './i18n';
import { register } from './serviceWorker';
import './styles/react-design-editor.css';

const antResources: Record<string, typeof koKR> = {
	ko: koKR,
	'ko-KR': koKR,
	en: enUS,
	'en-US': enUS,
};

const rootElement = (() => {
	const existingRoot = document.getElementById('root');
	if (existingRoot) {
		return existingRoot;
	}
	const root = document.createElement('div');
	root.id = 'root';
	document.body.appendChild(root);
	return root;
})();

const root = createRoot(rootElement);

const render = (Component: React.ElementType) => {
	root.render(
		<HelmetProvider>
			<ConfigProvider locale={antResources[i18next.language] || enUS}>
				<Component />
			</ConfigProvider>
		</HelmetProvider>,
	);
};

i18nClient();

render(App);

register();
