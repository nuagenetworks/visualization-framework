import { Map } from 'immutable';
import { ActionTypes, ActionKeyStore } from './actions';
import { ServiceManager } from "../index"


let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some configuration information
                    .set(ActionKeyStore.REQUESTS, Map())
                    .set(ActionKeyStore.SCROLL_DATA, Map()); // eslint-disable-line


function didStartRequest(state, requestID) {
    return state.setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.IS_FETCHING], true)
                .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.ERROR], false);
}

function didReceiveResponse(state, requestID, results, forceCache, loader) {

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
    let scrollData = state.getIn([ActionKeyStore.SCROLL_DATA, id])
    if(!scrollData) {
        scrollData = {}
    }

    return state
        .setIn([ActionKeyStore.SCROLL_DATA, id], Object.assign({}, scrollData, data))
}

function servicesReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.SERVICE_MANAGER_DID_START_REQUEST:
            return didStartRequest(state, action.requestID);

        case ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.requestID, action.results, action.forceCache, action.loader);

        case ActionTypes.SERVICE_MANAGER_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.requestID, action.error);

        case ActionTypes.SERVICE_MANAGER_DELETE_REQUEST:
            return deleteRequest(state, action.requestID);

        case ActionTypes.SERVICE_MANAGER_SCROLL_DATA:
            return saveScrollData(state, action.id, action.data)
        default:
            return state;
    }

};


export default servicesReducer;
