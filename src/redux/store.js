import {createStore, applyMiddleware, compose, combineReducers} from "redux";
import { reduxReactRouter, routerStateReducer } from "redux-router";
import { createHistory } from "history";

import thunkMiddleware from "redux-thunk";
import createLogger from "redux-logger";

import configurationsReducer from "../services/configurations/redux/reducer";
import interfaceReducer from "../components/App/redux/reducer";
import messageBoxReducer from "../components/MessageBox/redux/reducer";
import serviceReducer from "../services/servicemanager/redux/reducer";
import VSDReducer from "../configs/nuage/vsd/redux/reducer"

import { Actions as VSDActions, ActionKeyStore as VSDActionKeyStore} from "../configs/nuage/vsd/redux/actions"
import { Actions as ServiceActions } from "../services/servicemanager/redux/actions";


const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    configurations: configurationsReducer,
    interface: interfaceReducer,
    messageBox: messageBoxReducer,
    router: routerStateReducer,
    services: serviceReducer,
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

    if (state.router.location.query.token && state.router.location.query.token !== state.VSD.get(VSDActionKeyStore.TOKEN)) {
        store.dispatch(VSDActions.setSettings(store.getState().router.location.query.token, store.getState().router.location.query.api));
    }

    // Fetch licenses if necessary
    store.dispatch(ServiceActions.fetchIfNeeded({
        parentResource: "licenses"
    },
    "VSD",
    true));
});

export default store;
