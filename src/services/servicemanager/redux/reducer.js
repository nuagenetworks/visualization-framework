import { Map } from 'immutable';

import { ActionTypes, ActionKeyStore } from './actions';
import { ServiceManager } from "../index"

let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some configuration information
                    .set(ActionKeyStore.REQUESTS, Map())
                    .set(ActionKeyStore.SCROLL_DATA, Map()); // eslint-disable-line


function didStartRequest(state, requestID, dashboard = null) {
    return state.setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.IS_FETCHING], true)
                .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.DASHBOARD], dashboard)
                .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.ERROR], false);
}

function didReceiveResponse(state, requestID, results, forceCache) {
    const timingCache    = forceCache ? 86400000 : ServiceManager.config.timingCache, // forceCache equals to 24h
          currentDate    = Date.now(),
          expirationDate = currentDate + timingCache;

    return state
      .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.IS_FETCHING], false)
      .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.RESULTS], results)
      .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.EXPIRATION_DATE], expirationDate);
}

function didReceiveError(state, requestID, error) {
    return state
        .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.IS_FETCHING], false)
        .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.ERROR], error)
        .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.RESULTS], []);
}

function deleteRequest(state, requestID) {
    return state.deleteIn([ActionKeyStore.REQUESTS, requestID]);
}

function saveScrollData(state, id, data) {

    if(id) {
        let scrollData = state.getIn([ActionKeyStore.SCROLL_DATA, id])
        if(!scrollData) {
            scrollData = {}
        }

        return state
            .setIn([ActionKeyStore.SCROLL_DATA, id], Object.assign({}, scrollData, data))
    }

    // If ID is not present then reset full page
    const requests = state.get(ActionKeyStore.SCROLL_DATA).toJS();
    const updatedState = {};

    for(let key in requests) {
        if(requests.hasOwnProperty(key)) {
            const data = state.getIn([ActionKeyStore.SCROLL_DATA, key])
            updatedState[key] = { ...data, page: 1 };
        }
    }

    return state.set(ActionKeyStore.SCROLL_DATA, new Map(Object.entries(updatedState)));
}

function resetServices(state, dashboard) {
    const requests = state.get(ActionKeyStore.REQUESTS).toJS();
    const updatedState = {};

    for(let key in requests) {
        if(requests.hasOwnProperty(key) && dashboard && requests[key].dashboard !== dashboard) {
            updatedState[key] = state.getIn([ActionKeyStore.REQUESTS, key]);
        }
    }

    return state
        .set(ActionKeyStore.REQUESTS, new Map(Object.entries(updatedState)))
        .set(ActionKeyStore.SCROLL_DATA, Map());
}

function servicesReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.SERVICE_MANAGER_DID_START_REQUEST:
            return didStartRequest(state, action.requestID, action.dashboard);

        case ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.requestID, action.results, action.forceCache);

        case ActionTypes.SERVICE_MANAGER_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.requestID, action.error);

        case ActionTypes.SERVICE_MANAGER_DELETE_REQUEST:
            return deleteRequest(state, action.requestID);

        case ActionTypes.SERVICE_MANAGER_SCROLL_DATA:
            return saveScrollData(state, action.id, action.data)

        case ActionTypes.SERVICE_MANAGER_RESET_SERVICES:
            return resetServices(state, action.dashboard)
        default:
            return state;
    }

};


export default servicesReducer;
