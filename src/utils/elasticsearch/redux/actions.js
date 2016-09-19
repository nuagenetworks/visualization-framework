import { search } from '../index';

export const ActionTypes = {
    ES_WILL_START_REQUEST: "ES_WILL_START_REQUEST",
    ES_DID_START_REQUEST: "ES_DID_START_REQUEST",
    ES_DID_RECEIVE_RESPONSE: "ES_DID_RECEIVE_RESPONSE",
    ES_DID_RECEIVE_ERROR: "ES_DID_RECEIVE_ERROR",
};

export const ActionKeyStore = {
    KEY_STORE_ERROR: "error",
    KEY_STORE_IS_FETCHING: "isFetching",
    KEY_STORE_RESULTS: "results",
    KEY_STORE_ALL_REQUESTS: "requests",
};

export const Actions = {

    // This is a thunk action creator that will
    // initiate a request to ElasticSearch.
    fetch: function () {
        return function (dispatch){
            var requestID = 'temporaryID'
            dispatch(Actions.willStartRequest(requestID));
            dispatch(Actions.didStartRequest(requestID));

            search({
                q: 'domains',

            }).then(function () {
                let results = ['domain 1', 'domain 2', 'domain 3', 'domain 4'];
                dispatch(Actions.didReceiveResponse(requestID, results));

            }, function (error) {
                dispatch(Actions.didReceiveError(requestID, error));
                dispatch(Actions.didReceiveResponse(requestID, []));
            });
        }
    },

    willStartRequest: function(requestID) {
        return {
            type: ActionTypes.ES_WILL_START_REQUEST,
            requestID: requestID,
        };
    },
    didStartRequest: function(requestID) {
        return {
            type: ActionTypes.ES_DID_START_REQUEST,
            requestID: requestID,
        };
    },
    didReceiveResponse: function(requestID, results) {
        return {
            type: ActionTypes.ES_DID_RECEIVE_RESPONSE,
            requestID: requestID,
            results: results
        };
    },
    didReceiveError: function(requestID, error) {
        return {
            type: ActionTypes.ES_DID_RECEIVE_ERROR,
            requestID: requestID,
            error: error
        };
    },
};
