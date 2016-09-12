import {createStore, applyMiddleware, compose, combineReducers} from 'redux';
import { reduxReactRouter, routerStateReducer } from 'redux-router';
import createLogger from 'redux-logger';
import thunk from 'redux-thunk';
import interfaceReducer from '../components/redux/reducer';
import { createHistory } from 'history';

const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    interface: interfaceReducer,
    router: routerStateReducer
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

const createStoreWithRouterAndMiddleware = compose(
    reduxReactRouter({createHistory}),
    applyMiddleware(loggerMiddleware, thunk)
)(createStore);

let store = createStoreWithRouterAndMiddleware(rootReducer);

export default store;
