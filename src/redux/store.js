import {createStore, applyMiddleware, combineReducers, compose} from "redux";
import { reduxReactRouter, routerStateReducer } from "redux-router";
import { createHistory } from "history";
import { composeWithDevTools } from 'redux-devtools-extension';

import thunkMiddleware from "redux-thunk";
import createLogger from "redux-logger";
import { reducer as formReducer } from 'redux-form';
import { updateContextMiddleware, updateVisualizationTypeMiddleware, updateConfigurationMiddleware } from "./middlewares";

import configurationsReducer from "../services/configurations/redux/reducer";
import ESReducer from "../configs/nuage/elasticsearch/redux/reducer";
import interfaceReducer from "../components/App/redux/reducer";
import messageBoxReducer from "../components/MessageBox/redux/reducer";
import serviceReducer from "../services/servicemanager/redux/reducer";
import testingReducer from "../components/Testing/redux/reducer";
import VSDReducer from "../configs/nuage/vsd/redux/reducer";
import VFSReducer from "../features/redux/reducer";

import { reducer as tooltip } from 'redux-tooltip';


const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    configurations: configurationsReducer,
    ES: ESReducer,
    interface: interfaceReducer,
    messageBox: messageBoxReducer,
    router: routerStateReducer,
    services: serviceReducer,
    testReducer: testingReducer,
    VSD: VSDReducer,
    VFS: VFSReducer,
    form: formReducer,
    tooltip
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    }) : compose

const enhancer = composeEnhancers(
  applyMiddleware(
      thunkMiddleware,
      loggerMiddleware,
      updateContextMiddleware,
      updateVisualizationTypeMiddleware,
      updateConfigurationMiddleware
  )
  // other store enhancers if any
);

// TODO - replace compose with composeWithDevTools
const createStoreWithRouterAndMiddleware = compose(
    reduxReactRouter({createHistory}),
    enhancer
)(createStore);

let store = createStoreWithRouterAndMiddleware(rootReducer);

store.subscribe(function() {

    //const state = store.getState();
    /*if (state.router) {

        if (state.router.location.query.token && state.router.location.query.token !== state.VSD.get(VSDActionKeyStore.TOKEN))
            store.dispatch(VSDActions.setSettings(state.router.location.query.token, state.router.location.query.api, state.router.location.query.org));

        if (state.router.location.query.eshost && state.router.location.query.eshost !== state.ES.get(ESActionKeyStore.ES_HOST))
            store.dispatch(ESActions.setSettings(state.router.location.query.eshost));
    }*/

    // Try to fetch the enterprises to verify the given token
    /*let configuration = {
        service: "VSD",
        query: {
            parentResource: "enterprises",
        }
    }
    store.dispatch(ServiceActions.fetchIfNeeded(configuration, null, null, true)) // No context and force cache*/
});

export default store;
