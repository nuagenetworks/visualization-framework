import { Map } from 'immutable';
import { ActionTypes, ActionKeyStore } from './actions';
import { ServiceManager } from "../index"


let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some configuration information
                    .set(ActionKeyStore.REQUESTS, Map()); // eslint-disable-line


function didStartRequest(state, requestID) {
    return state.setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.IS_FETCHING], true)
                .setIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.ERROR], null);
}

function didReceiveResponse(state, requestID, results) {
    const currentDate    = new Date(),
          expirationDate = currentDate.setTime(currentDate.getTime() + ServiceManager.config.timingCache);

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
function servicesReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.SERVICE_MANAGER_DID_START_REQUEST:
            return didStartRequest(state, action.requestID);

        case ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.requestID, action.results);

        case ActionTypes.SERVICE_MANAGER_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.requestID, action.error);

        default:
            return state;
    }

};


export default servicesReducer;
