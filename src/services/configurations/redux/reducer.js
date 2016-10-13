import { fromJS, Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions";

import { ConfigurationService } from "../index"

let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some elastic search configuration information
                    .set(ActionKeyStore.DASHBOARDS, Map()) // eslint-disable-line
                    .set(ActionKeyStore.VISUALIZATIONS, Map()) // eslint-disable-line
                    .set(ActionKeyStore.QUERIES, Map()); // eslint-disable-line


function didStartRequest(state, id, configType) {
    return state.setIn([configType, id, ActionKeyStore.IS_FETCHING], true);
}

function didReceiveResponse(state, id, configType, data) {
    const currentDate    = new Date(),
          expirationDate = currentDate.setTime(currentDate.getTime() + ConfigurationService.config.timingCache);

    return state
      .setIn([configType, id, ActionKeyStore.IS_FETCHING], false)
      .setIn([configType, id, ActionKeyStore.DATA], fromJS(data))
      .setIn([configType, id, ActionKeyStore.EXPIRATION_DATE], expirationDate);
}

function didReceiveError(state, id, configType, error) {
    return state
        .setIn([configType, id, ActionKeyStore.IS_FETCHING], false)
        .setIn([configType, id, ActionKeyStore.DATA], fromJS([]))
        .setIn([configType, id, ActionKeyStore.ERROR], fromJS(error));
}

function configurationsReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.CONFIG_DID_START_REQUEST:
            return didStartRequest(state, action.id, action.configType);

        case ActionTypes.CONFIG_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.id, action.configType, action.data);

        case ActionTypes.CONFIG_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.id, action.configType, action.error);

        default:
            return state;
    }
};

export default configurationsReducer;
