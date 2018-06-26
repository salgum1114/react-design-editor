import { createStore, applyMiddleware, compose } from 'redux';
import thunkMiddleware from 'redux-thunk';

import reducers from '../reducers';

export default function () {
    let store;
    const enhancer = applyMiddleware(thunkMiddleware);
    if (process.env.NODE_ENV === 'development'
    && window.__REDUX_DEVTOOLS_EXTENSION__
    && window.__REDUX_DEVTOOLS_EXTENSION__()) {
        const reduxDevtool = window.__REDUX_DEVTOOLS_EXTENSION__ && window.__REDUX_DEVTOOLS_EXTENSION__(); // Chrome Extension Redux Devtools
        store = createStore(reducers, compose(enhancer, reduxDevtool));
    } else {
        store = createStore(reducers, enhancer);
    }
    if (module.hot) {
        module.hot.accept('../reducers', () => {
            const nextReducers = require('../reducers/index');
            store.replaceReducer(nextReducers);
        });
    }
    return store;
}
