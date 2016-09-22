import {createStore, applyMiddleware, compose, combineReducers} from "redux";
import { reduxReactRouter, routerStateReducer } from "redux-router";
import { createHistory } from "history";

import thunkMiddleware from "redux-thunk";
import createLogger from "redux-logger";

import configurationsReducer from "../services/configurations/redux/reducer";
import elasticsearchReducer from "../services/elasticsearch/redux/reducer";
import interfaceReducer from "../components/App/redux/reducer";
import messageBoxReducer from "../components/MessageBox/redux/reducer";
import VSDReducer from "../configs/nuage/redux/reducer"

import { Actions as VSDActions, ActionKeyStore as VSDActionKeyStore} from "../configs/nuage/redux/actions"


const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    configurations: configurationsReducer,
    elasticsearch: elasticsearchReducer,
    interface: interfaceReducer,
    messageBox: messageBoxReducer,
    router: routerStateReducer,
    VSD: VSDReducer,
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

store.subscribe(function() {
    const state = store.getState();
    if (state.router.location.query.token && state.router.location.query.token !== state.VSD.get(VSDActionKeyStore.TOKEN))
    {
        store.dispatch(VSDActions.setSettings(store.getState().router.location.query.token, store.getState().router.location.query.api));
        store.dispatch(VSDActions.fetch("me"));
    }
});

export default store;
