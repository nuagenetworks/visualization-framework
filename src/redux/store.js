import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import { reduxReactRouter, routerStateReducer } from 'redux-router';
import thunkMiddleware from 'redux-thunk';
import createLogger from 'redux-logger';
import interfaceReducer from '../components/redux/reducer';
import elasticsearchReducer from '../utils/redux/reducer';
import { createHistory } from 'history';

const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    interface: interfaceReducer,
    elasticsearch: elasticsearchReducer,
    router: routerStateReducer
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

const createStoreWithRouterAndMiddleware = compose(
    reduxReactRouter({createHistory}),
    applyMiddleware(
        thunkMiddleware,
        loggerMiddleware
    )
)(createStore);

let store = createStoreWithRouterAndMiddleware(rootReducer);

export default store;
