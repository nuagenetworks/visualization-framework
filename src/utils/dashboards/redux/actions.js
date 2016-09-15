import { fetchConfiguration } from '../index';

export const ActionTypes = {
    DASHBOARD_DID_START_REQUEST: "DASHBOARD_DID_START_REQUEST",
    DASHBOARD_DID_RECEIVE_RESPONSE: "DASHBOARD_DID_RECEIVE_RESPONSE",
    DASHBOARD_DID_RECEIVE_ERROR: "DASHBOARD_DID_RECEIVE_ERROR",
};

export const ActionKeyStore = {
    KEY_STORE_DASHBOARDS: "dashboards",
    KEY_STORE_DATA: "data",
    KEY_STORE_ERROR: "error",
    KEY_STORE_IS_FETCHING: "isFetching",
};

export const Actions = {
    fetch: function (dashboardID) {
        return function (dispatch){
            dispatch(Actions.didStartRequest(dashboardID));

            fetchConfiguration(dashboardID)
                .then(function (data) {
                    dispatch(Actions.didReceiveResponse(dashboardID, data));
                })
                .catch(function (error) {
                    dispatch(Actions.didReceiveError(dashboardID, error));
                    dispatch(Actions.didReceiveResponse(dashboardID, []));
                });
        }
    },
    didStartRequest: function(dashboardID) {
        return {
            type: ActionTypes.DASHBOARD_DID_START_REQUEST,
            dashboardID: dashboardID,
        };
    },
    didReceiveResponse: function(dashboardID, data) {
        return {
            type: ActionTypes.DASHBOARD_DID_RECEIVE_RESPONSE,
            dashboardID: dashboardID,
            data: data
        };
    },
    didReceiveError: function(dashboardID, error) {
        return {
            type: ActionTypes.DASHBOARD_DID_RECEIVE_ERROR,
            dashboardID: dashboardID,
            error: error
        };
    },
};
