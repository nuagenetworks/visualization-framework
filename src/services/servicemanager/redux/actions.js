import { ServiceManager } from "../index"

export const ActionTypes = {
    SERVICE_MANAGER_DID_START_REQUEST: "SERVICE_MANAGER_DID_START_REQUEST",
    SERVICE_MANAGER_DID_RECEIVE_RESPONSE: "SERVICE_MANAGER_DID_RECEIVE_RESPONSE",
    SERVICE_MANAGER_DID_RECEIVE_ERROR: "SERVICE_MANAGER_DID_RECEIVE_ERROR",
};

export const ActionKeyStore = {
    ERROR: "error",
    IS_FETCHING: "isFetching",
    RESULTS: "results",
    REQUESTS: "requests",
};


export const Actions = {

    /*
        Make a query on the service based on the service name.

        Arguments:
        * query: the parameterized query
        * serviceName: the service name we should use to make the query
    */
    fetch: function (query, serviceName) {

        let service = ServiceManager.getService(serviceName);

        return function (dispatch, getState) {
            let requestID = service.getRequestID(query);

            dispatch(Actions.didStartRequest(requestID));

            return service.fetch(query, getState())
                .then(function (results) {
                    dispatch(Actions.didReceiveResponse(requestID, results));

                }, function (error) {
                    if (process.env.NODE_ENV === "development" && service.hasOwnProperty("getMockResponse")) {
                        dispatch(Actions.didReceiveResponse(requestID, service.getMockResponse(requestID)));
                    }
                    else
                    {
                        dispatch(Actions.didReceiveError(requestID, error));
                    }
                });
        }
    },
    didStartRequest: function(requestID) {
        return {
            type: ActionTypes.SERVICE_MANAGER_DID_START_REQUEST,
            requestID: requestID,
        };
    },
    didReceiveResponse: function(requestID, results) {
        return {
            type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE,
            requestID: requestID,
            results: results
        };
    },
    didReceiveError: function(requestID, error) {
        return {
            type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_ERROR,
            requestID: requestID,
            error: error
        };
    },
};
