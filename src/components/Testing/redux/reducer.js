import { fromJS, Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions";

let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some elastic search configuration information
                    .set(ActionKeyStore.LIST, Map()) // eslint-disable-line
                    .set(ActionKeyStore.DETAIL, Map());


function didStartRequest(state, id, configUrl) {
    return state.setIn([configUrl, ActionKeyStore.IS_FETCHING], true);
}

function didReceiveResponse(state, configUrl, data) {
    
    return state
      .setIn([configUrl, ActionKeyStore.IS_FETCHING], false)
      .setIn([configUrl, ActionKeyStore.DATA], fromJS(data));

}

function didReceiveError(state, configUrl, error) {
    return state
        .setIn([configUrl, ActionKeyStore.IS_FETCHING], false)
        .setIn([configUrl, ActionKeyStore.DATA], fromJS([]))
        .setIn([configUrl, ActionKeyStore.ERROR], fromJS(error));
}

function testingReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.REPORT_DID_START_REQUEST:
            return didStartRequest(state, action.configUrl);

        case ActionTypes.REPORT_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.configUrl, action.data);

        case ActionTypes.REPORT_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.id, action.configUrl, action.error);

        default:
            return state;
    }
};

export default testingReducer;
