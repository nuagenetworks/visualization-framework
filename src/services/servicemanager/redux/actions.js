import { ServiceManager } from "../index"
import { parameterizedConfiguration } from "../../../utils/configurations";

export const ActionTypes = {
    SERVICE_MANAGER_DID_START_REQUEST: "SERVICE_MANAGER_DID_START_REQUEST",
    SERVICE_MANAGER_DID_RECEIVE_RESPONSE: "SERVICE_MANAGER_DID_RECEIVE_RESPONSE",
    SERVICE_MANAGER_DID_RECEIVE_ERROR: "SERVICE_MANAGER_DID_RECEIVE_ERROR",
    SERVICE_MANAGER_DELETE_REQUEST: "SERVICE_MANAGER_DELETE_REQUEST",
};

export const ActionKeyStore = {
    ERROR: "error",
    IS_FETCHING: "isFetching",
    RESULTS: "results",
    REQUESTS: "requests",
    EXPIRATION_DATE: "expirationDate",
};

// TODO: Temporary - Replace this part in the middleware
function executeScript(scriptName, context) {

    const requestID = ServiceManager.getRequestID(scriptName, context);

    return (dispatch) => {
        dispatch(didStartRequest(requestID));

        return ServiceManager.executeScript(scriptName, context)
            .then(
            (results) => {
                dispatch(didReceiveResponse(requestID, results));
                return Promise.resolve(results);
            },
            (error) => {
                dispatch(didReceiveError(requestID, error));
                return Promise.resolve();
            });
    }
}

/*
    Make a query on the service based on the service name.
    Arguments:
    * query: the query configuration
    * context: the context if the query should be parameterized
    * forceCache: a boolean to force storing the value for a long period
*/
function fetch({queryConfiguration, context, configuration, forceCache}) {

    let service = ServiceManager.getService(queryConfiguration.service);

    return (dispatch, getState) => {
        let requestID = service.getRequestID(queryConfiguration, context);

        if (context) {
            const pQuery = parameterizedConfiguration(queryConfiguration, context);

            if (pQuery)
               queryConfiguration = pQuery;
            else
                return Promise.reject("Provided context does not allow to parameterized query " + configuration.id);
        }

        dispatch(didStartRequest(requestID));

        return ServiceManager.fetchData(configuration.id, queryConfiguration, context)
            .then(
            (results) => {

                const data = ServiceManager.tabify(queryConfiguration, results);

                dispatch(didReceiveResponse(requestID, data));
                return Promise.resolve(data);
            },
            (error) => {
                if (process.env.NODE_ENV === "development" && service.hasOwnProperty("getMockResponse")) {
                    try {
                        const response = service.getMockResponse(queryConfiguration);
                        dispatch(didReceiveResponse(requestID, response, forceCache));
                    } catch(e) {
                        dispatch(didReceiveError(requestID, e, forceCache));
                    }

                    return Promise.resolve();
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

    let currentDate = Date.now(),
        expireDate  = request.get(ActionKeyStore.EXPIRATION_DATE);

    return !request.get(ActionKeyStore.IS_FETCHING) && currentDate > expireDate;
}


/*
    Make a request on the service based on the service name.

    Arguments:
    * query: the visualization configuration
    * context: the context if the query should be parameterized
    * queryConfiguration" : the query configuration
    * forceCache: a boolean to force storing the value for a long period
*/

function fetchIfNeeded(queryConfiguration, context = {}, configuration = {}, forceCache = false) {
    const isScript = configuration.query ? false : true;
    let requestID;

    if (isScript) {
        requestID = ServiceManager.getRequestID(queryConfiguration, context);
    } else {
        let service = ServiceManager.getService(queryConfiguration.service);
        requestID = service.getRequestID(queryConfiguration, context);
    }

    return (dispatch, getState) => {
        if (!requestID)
            return Promise.reject();

        const state = getState(),
            request = state.services.getIn([ActionKeyStore.REQUESTS, requestID]);

        if (shouldFetch(request)) {
            return dispatch(fetch({queryConfiguration, context, configuration, forceCache}))

        } else {
            return Promise.resolve()
        }
    }
}

function post(query, body, context, forceCache) {
    let service = ServiceManager.getService(query.service);

    return (dispatch, getState) => {
        let requestID = service.getRequestID(query, context);

        if (context) {
            const pQuery = parameterizedConfiguration(query, context);

            if (pQuery)
                query = pQuery;
            else
                return Promise.reject("Provided context does not allow to parameterized query " + query.id);
        }

        dispatch(didStartRequest(requestID));

        return service.post(query, body, getState())
            .then(
            (results) => {
                dispatch(didReceiveResponse(requestID, results));
                return Promise.resolve(results);
            },
            (error) => {
                dispatch(didReceiveError(requestID, error));
                return Promise.resolve();
            });

    }
}

function postIfNeeded(query, body, context, forceCache) {
    const service = ServiceManager.getService(query.service);
    const requestID = service.getRequestID(query, context);

    return (dispatch, getState) => {
        if (!requestID)
            return Promise.reject();

        const state = getState(),
              request = state.services.getIn([ActionKeyStore.REQUESTS, requestID]);

        if (shouldFetch(request)) {
            return dispatch(post(query, body, context, forceCache));

        } else {
            return Promise.resolve();
        }
    }
}

function update(query, body, context, forceCache) {
    let service = ServiceManager.getService(query.service);

    return (dispatch, getState) => {
        let requestID = service.getRequestID(query, context);

        if (context) {
            const pQuery = parameterizedConfiguration(query, context);

            if (pQuery)
                query = pQuery;
            else
                return Promise.reject("Provided context does not allow to parameterized query " + query.id);
        }

        dispatch(didStartRequest(requestID));

        return service.update(query, body, getState())
            .then(
            (results) => {
                dispatch(didReceiveResponse(requestID, results));
                return Promise.resolve(results);
            },
            (error) => {
                dispatch(didReceiveError(requestID, error));
                return Promise.resolve();
            });
    }
}

function updateIfNeeded(query, body, context, forceCache) {
    const service = ServiceManager.getService(query.service);
    const requestID = service.getRequestID(query, context);

    return (dispatch, getState) => {
        if (!requestID)
            return Promise.reject();

        const state = getState(),
              request = state.services.getIn([ActionKeyStore.REQUESTS, requestID]);

        if (shouldFetch(request)) {
            return dispatch(update(query, body, context, forceCache));

        } else {
            return Promise.resolve();
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

function deleteRequest(requestID) {
    return {
        type: ActionTypes.SERVICE_MANAGER_DELETE_REQUEST,
        requestID: requestID,
    };
}

export const Actions = {
    fetch: fetch,
    fetchIfNeeded: fetchIfNeeded,
    didStartRequest: didStartRequest,
    didReceiveResponse: didReceiveResponse,
    didReceiveError: didReceiveError,
    postIfNeeded: postIfNeeded,
    deleteRequest: deleteRequest,
    updateIfNeeded: updateIfNeeded,
};