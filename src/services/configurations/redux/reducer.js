import { fromJS, Map } from 'immutable';
import { ActionTypes, ActionKeyStore } from './actions';

let initialState = Map() // eslint-disable-line
                    // .set(,) // Usefull if we need to set some elastic search configuration information
                    .set(ActionKeyStore.DASHBOARDS, Map()); // eslint-disable-line


function didStartRequest(state, dashboardID) {
    return state.setIn([ActionKeyStore.DASHBOARDS, dashboardID, ActionKeyStore.IS_FETCHING], true);
}

function didReceiveResponse(state, dashboardID, data) {
    return state
      .setIn([ActionKeyStore.DASHBOARDS, dashboardID, ActionKeyStore.IS_FETCHING], false)
      .setIn([ActionKeyStore.DASHBOARDS, dashboardID, ActionKeyStore.DATA], fromJS(data));
}

function didReceiveError(state, dashboardID, error) {
    return state
        .setIn([ActionKeyStore.DASHBOARDS, dashboardID, ActionKeyStore.IS_FETCHING], false)
        .setIn([ActionKeyStore.DASHBOARDS, dashboardID, ActionKeyStore.DATA], fromJS([]))
        .setIn([ActionKeyStore.DASHBOARDS, dashboardID, ActionKeyStore.ERROR], fromJS(error));
}

function dashboardsReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.DASHBOARD_DID_START_REQUEST:
            return didStartRequest(state, action.dashboardID);

        case ActionTypes.DASHBOARD_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.dashboardID, action.data);

        case ActionTypes.DASHBOARD_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.dashboardID, action.error);

        default:
            return state;
    }
};

export default dashboardsReducer;
