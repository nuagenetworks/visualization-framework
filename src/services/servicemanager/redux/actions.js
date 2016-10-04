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
    EXPIRATION_DATE: "expirationDate",
};


/*
    Make a query on the service based on the service name.

    Arguments:
    * query: the parameterized query
    * serviceName: the service name we should use to make the query
*/
function fetch(query, serviceName, forceCache) {

    let service = ServiceManager.getService(serviceName);

    return (dispatch, getState) => {
        let requestID = service.getRequestID(query);

        dispatch(didStartRequest(requestID));

        return service.fetch(query, getState())
            .then(
            (results) => {
                dispatch(didReceiveResponse(requestID, results));
                return Promise.resolve(results);
            },
            (error) => {
                if (process.env.NODE_ENV === "development" && service.hasOwnProperty("getMockResponse")) {
                    const response = service.getMockResponse(requestID);
                    dispatch(didReceiveResponse(requestID, response, forceCache));
                    return Promise.resolve(response);
                }
                else
                {
                    dispatch(didReceiveError(requestID, error));
                    return Promise.resolve();
                }
            });

    }
}

function shouldFetch(request) {
    if (!request)
        return true;

    let currentDate = new Date(),
        expireDate  = new Date(request.get(ActionKeyStore.EXPIRATION_DATE));

    return !request.get(ActionKeyStore.IS_FETCHING) && currentDate > expireDate;
}

function fetchIfNeeded(query, serviceName, forceCache) {
    let service   = ServiceManager.getService(serviceName),
        requestID = service.getRequestID(query);


    return (dispatch, getState) => {
        const state = getState(),
              request = state.services.getIn([ActionKeyStore.REQUESTS, requestID]);

        if (shouldFetch(request)) {
            return dispatch(fetch(query, serviceName, forceCache));

        } else {
            return Promise.resolve(request.get(ActionKeyStore.RESULTS));
        }
    }
}

function didStartRequest(requestID) {
    return {
        type: ActionTypes.SERVICE_MANAGER_DID_START_REQUEST,
        requestID: requestID,
    };
}

function didReceiveResponse(requestID, results, forceCache) {
    return {
        type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE,
        requestID: requestID,
        results: results,
        forceCache: forceCache
    };
}

function didReceiveError(requestID, error) {
    return {
        type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_ERROR,
        requestID: requestID,
        error: error
    };
}

export const Actions = {
    fetch: fetch,
    fetchIfNeeded: fetchIfNeeded,
    didStartRequest: didStartRequest,
    didReceiveResponse: didReceiveResponse,
    didReceiveError: didReceiveError,
};
