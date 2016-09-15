import { Map } from 'immutable';
import { ActionTypes, ActionKeyStore } from './actions';

let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some elastic search configuration information
                    .set(ActionKeyStore.KEY_STORE_ALL_REQUESTS, Map()); // eslint-disable-line


function willStartRequest(state, requestID) {
    // Initialize state structure
    return state.setIn([ActionKeyStore.KEY_STORE_ALL_REQUESTS, requestID, ActionKeyStore.KEY_STORE_IS_FETCHING], false)
                .setIn([ActionKeyStore.KEY_STORE_ALL_REQUESTS, requestID, ActionKeyStore.KEY_STORE_ERROR], null);
}

function didStartRequest(state, requestID) {
    return state.setIn([ActionKeyStore.KEY_STORE_ALL_REQUESTS, requestID, ActionKeyStore.KEY_STORE_IS_FETCHING], false);
}

function didReceiveResponse(state, requestID, results) {
    return state
      .setIn([ActionKeyStore.KEY_STORE_ALL_REQUESTS, requestID, ActionKeyStore.KEY_STORE_IS_FETCHING], false)
      .setIn([ActionKeyStore.KEY_STORE_ALL_REQUESTS, requestID, ActionKeyStore.KEY_STORE_RESULTS], results);
}

function didReceiveError(state, requestID, error) {
    return state
        .setIn([ActionKeyStore.KEY_STORE_ALL_REQUESTS, requestID, ActionKeyStore.KEY_STORE_IS_FETCHING], false)
        .setIn([ActionKeyStore.KEY_STORE_ALL_REQUESTS, requestID, ActionKeyStore.KEY_STORE_ERROR], error);
}
function elasticsearchReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ES_WILL_START_REQUEST:
            return willStartRequest(state, action.requestID);

        case ActionTypes.ES_DID_START_REQUEST:
            return didStartRequest(state, action.requestID);

        case ActionTypes.ES_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.requestID, action.results);

        case ActionTypes.ES_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.requestID, action.error);

        default:
            return state;
    }

};


export default elasticsearchReducer;
