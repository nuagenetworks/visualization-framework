import {createStore, applyMiddleware, combineReducers} from "redux";
import { createBrowserHistory } from "history";
import { composeWithDevTools } from 'redux-devtools-extension';

import thunkMiddleware from "redux-thunk";
import createLogger from "redux-logger";
import { reducer as formReducer } from 'redux-form';
import { routerMiddleware, connectRouter } from "connected-react-router";
import queryString from 'query-string';

import { updateContextMiddleware, updateVisualizationTypeMiddleware } from "./middlewares";

import configurationsReducer from "../services/configurations/redux/reducer";
import ESReducer from "../configs/nuage/elasticsearch/redux/reducer";
import interfaceReducer from "../components/App/redux/reducer";
import messageBoxReducer from "../components/MessageBox/redux/reducer";
import serviceReducer from "../services/servicemanager/redux/reducer";
import VSDReducer from "../configs/nuage/vsd/redux/reducer";
import VFSReducer from "../features/redux/reducer";

import { Actions as VSDActions, ActionKeyStore as VSDActionKeyStore} from "../configs/nuage/vsd/redux/actions"
import { Actions as ESActions, ActionKeyStore as ESActionKeyStore} from "../configs/nuage/elasticsearch/redux/actions"
import { Actions as ServiceActions } from "../services/servicemanager/redux/actions";

export const history = createBrowserHistory();
const loggerMiddleware = createLogger();

const appReducer = combineReducers({
    router: connectRouter(history),
    configurations: configurationsReducer,
    ES: ESReducer,
    interface: interfaceReducer,
    messageBox: messageBoxReducer,
    services: serviceReducer,
    VSD: VSDReducer,
    VFS: VFSReducer,
    form: formReducer,
});

const rootReducer = (state, action) => {
  return appReducer(state, action);
};

const createStoreWithRouterAndMiddleware = composeWithDevTools(
    applyMiddleware(
        routerMiddleware(history),
        thunkMiddleware,
        loggerMiddleware,
        updateContextMiddleware,
        updateVisualizationTypeMiddleware,
    )
)(createStore);

let store = createStoreWithRouterAndMiddleware(rootReducer);

store.subscribe(function() {
    const state = store.getState();

    if (state.router) {
        const query = queryString.parse(state.router.location.search);
        if (state.router && state.router.location && query &&  query.token && query.token !== state.VSD.get(VSDActionKeyStore.TOKEN))
            store.dispatch(VSDActions.setSettings(query.token, query.api, query.org));

        if (state.router && state.router.location && query && query.eshost && query.eshost !== state.ES.get(ESActionKeyStore.ES_HOST))
            store.dispatch(ESActions.setSettings(query.eshost));
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
