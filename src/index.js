import React from 'react';
import ReactDom from 'react-dom';
import { AppContainer } from 'react-hot-loader';

import App from './containers/App';

import registerServiceWorker from './registerServiceWorker';

const render = (Component) => {
    const rootElement = document.getElementById('root');
    ReactDom.render(
        <AppContainer>
            <Component />
        </AppContainer>,
        rootElement,
    );
};

render(App);
if (module.hot) {
    module.hot.accept('./containers/App', () => {
        render(App);
    });
}

registerServiceWorker();
