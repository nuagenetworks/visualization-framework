import { fetchConfiguration } from '../index';

export const ActionTypes = {
    CONFIG_DID_START_REQUEST: "CONFIG_DID_START_REQUEST",
    CONFIG_DID_RECEIVE_RESPONSE: "CONFIG_DID_RECEIVE_RESPONSE",
    CONFIG_DID_RECEIVE_ERROR: "CONFIG_DID_RECEIVE_ERROR",
};

export const ActionKeyStore = {
    DASHBOARDS: "dashboards",
    DATA: "data",
    ERROR: "error",
    IS_FETCHING: "isFetching",
};

export const Actions = {
    fetch: function (id) {
        return function (dispatch){
            dispatch(Actions.didStartRequest(id));

            // Important: It is essential for redux to return a promise in order
            // to test this method (See: http://redux.js.org/docs/recipes/WritingTests.html)
            return fetchConfiguration(id)
                .then(function (data) {
                    dispatch(Actions.didReceiveResponse(id, data));
                })
                .catch(function (error) {
                    dispatch(Actions.didReceiveError(id, error.message));
                });
        }
    },
    didStartRequest: function(id) {
        return {
            type: ActionTypes.CONFIG_DID_START_REQUEST,
            id: id,
        };
    },
    didReceiveResponse: function(id, data) {
        return {
            type: ActionTypes.CONFIG_DID_RECEIVE_RESPONSE,
            id: id,
            data: data
        };
    },
    didReceiveError: function(id, error) {
        return {
            type: ActionTypes.CONFIG_DID_RECEIVE_ERROR,
            id: id,
            error: error
        };
    },
};
