import React from 'react';
import ReactDom from 'react-dom';
import { AppContainer } from 'react-hot-loader';
import { Provider } from 'react-redux';

import './styles';
import store from './store';
import App from './containers/App';

const render = (Component) => {
    const rootElement = document.getElementById('root');
    ReactDom.render(
        <AppContainer>
            <Provider store={store()}>
                <Component />
            </Provider>
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
