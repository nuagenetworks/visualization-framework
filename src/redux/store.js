import {createStore, applyMiddleware, compose, combineReducers} from "redux";
import { reduxReactRouter, routerStateReducer } from "redux-router";
import { createHistory } from "history";

import thunkMiddleware from "redux-thunk";
import createLogger from "redux-logger";
import { updateContextMiddleware, updateVisualizationTypeMiddleware } from "./middlewares";

import configurationsReducer from "../services/configurations/redux/reducer";
import ESReducer from "../configs/nuage/elasticsearch/redux/reducer";
import interfaceReducer from "../components/App/redux/reducer";
import messageBoxReducer from "../components/MessageBox/redux/reducer";
import serviceReducer from "../services/servicemanager/redux/reducer";
import VSDReducer from "../configs/nuage/vsd/redux/reducer";

import { Actions as VSDActions, ActionKeyStore as VSDActionKeyStore} from "../configs/nuage/vsd/redux/actions"
import { Actions as ESActions, ActionKeyStore as ESActionKeyStore} from "../configs/nuage/elasticsearch/redux/actions"
import { Actions as ServiceActions } from "../services/servicemanager/redux/actions";

const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    configurations: configurationsReducer,
    ES: ESReducer,
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
        loggerMiddleware,
        updateContextMiddleware,
        updateVisualizationTypeMiddleware
    )
)(createStore);

let store = createStoreWithRouterAndMiddleware(rootReducer);

store.subscribe(function() {
    const state = store.getState();

    if (state.router) {

        if (state.router.location.query.token && state.router.location.query.token !== state.VSD.get(VSDActionKeyStore.TOKEN))
            store.dispatch(VSDActions.setSettings(state.router.location.query.token, state.router.location.query.api, state.router.location.query.org));

        if (state.router.location.query.eshost && state.router.location.query.eshost !== state.ES.get(ESActionKeyStore.ES_HOST))
            store.dispatch(ESActions.setSettings(state.router.location.query.eshost));
    }

    // Try to fetch the enterprises to verify the given token
    let configuration = {
        service: "VSD",
        query: {
            parentResource: "enterprises",
        }
    }
    store.dispatch(ServiceActions.fetchIfNeeded(configuration, null, true)) // No context and force cache
});

export default store;
