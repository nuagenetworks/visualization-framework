import { fromJS, Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions";

import { ConfigurationService } from "../index"

let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some elastic search configuration information
                    .set(ActionKeyStore.DASHBOARDS, Map()) // eslint-disable-line
                    .set(ActionKeyStore.VISUALIZATIONS, Map());


function didStartRequest(state, id, configType) {
    return state.setIn([configType, id, ActionKeyStore.IS_FETCHING], true);
}

function didReceiveResponse(state, id, configType, data) {
    const currentDate    = Date.now(),
          expirationDate = currentDate + ConfigurationService.config.cachingTime;

    let newState = state
      .setIn([configType, id, ActionKeyStore.IS_FETCHING], false)
      .setIn([configType, id, ActionKeyStore.DATA], fromJS(data))
      .setIn([configType, id, ActionKeyStore.EXPIRATION_DATE], expirationDate);

    if(configType === ActionKeyStore.DASHBOARDS && data.visualizations) {
      for (let viz of fromJS(data.visualizations)) {
        newState = newState
          .setIn([ActionKeyStore.VISUALIZATIONS, viz.get('id'), ActionKeyStore.IS_FETCHING], false)
          .setIn([ActionKeyStore.VISUALIZATIONS, viz.get('id'), ActionKeyStore.DATA], viz.get('visualization'))
          .setIn([ActionKeyStore.VISUALIZATIONS, viz.get('id'), ActionKeyStore.EXPIRATION_DATE], expirationDate);
      }
    }

    return newState;
}

function didReceiveError(state, id, configType, error) {
    return state
        .setIn([configType, id, ActionKeyStore.IS_FETCHING], false)
        .setIn([configType, id, ActionKeyStore.DATA], fromJS([]))
        .setIn([configType, id, ActionKeyStore.ERROR], fromJS(error));
}

function resetConfiguration(state) {
    return state
            .set(ActionKeyStore.DASHBOARDS, Map())
            .set(ActionKeyStore.VISUALIZATIONS, Map())
            .set(ActionKeyStore.QUERIES, Map());
}

function configurationsReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.CONFIG_DID_START_REQUEST:
            return didStartRequest(state, action.id, action.configType);

        case ActionTypes.CONFIG_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.id, action.configType, action.data);

        case ActionTypes.CONFIG_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.id, action.configType, action.error);

        case ActionTypes.RESET_CONFIGURATION:
            return resetConfiguration(state);

        default:
            return state;
    }
};

export default configurationsReducer;
