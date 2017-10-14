import {createStore, applyMiddleware, compose, combineReducers} from "redux";
import { reduxReactRouter, routerStateReducer } from "redux-router";
import { createHistory } from "history";

import thunkMiddleware from "redux-thunk";
import createLogger from "redux-logger";
import { updateContextMiddleware, updateVisualizationTypeMiddleware, updateConfigurationMiddleware } from "./middlewares";

import configurationsReducer from "../services/configurations/redux/reducer";
import interfaceReducer from "../components/App/redux/reducer";
import messageBoxReducer from "../components/MessageBox/redux/reducer";
import serviceReducer from "../services/servicemanager/redux/reducer";

const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    configurations: configurationsReducer,
    interface: interfaceReducer,
    messageBox: messageBoxReducer,
    router: routerStateReducer,
    services: serviceReducer
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

const composeEnhancers =
  typeof window === 'object' &&
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ ?
    window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
    }) : compose;

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
