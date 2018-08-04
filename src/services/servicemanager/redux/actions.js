import _ from "lodash";
import objectPath from "object-path"
import { ServiceManager } from "../index"
import { parameterizedConfiguration } from "../../../utils/configurations";

import config from '../../../config';
import { events } from '../../../lib/vis-graphs/utils/types';

export const ActionTypes = {
    SERVICE_MANAGER_DID_START_REQUEST: "SERVICE_MANAGER_DID_START_REQUEST",
    SERVICE_MANAGER_DID_RECEIVE_RESPONSE: "SERVICE_MANAGER_DID_RECEIVE_RESPONSE",
    SERVICE_MANAGER_DID_RECEIVE_ERROR: "SERVICE_MANAGER_DID_RECEIVE_ERROR",
    SERVICE_MANAGER_DELETE_REQUEST: "SERVICE_MANAGER_DELETE_REQUEST",
    SERVICE_MANAGER_SCROLL_DATA: "SERVICE_MANAGER_SCROLL_DATA"
};

export const ActionKeyStore = {
    ERROR: "error",
    IS_FETCHING: "isFetching",
    RESULTS: "results",
    REQUESTS: "requests",
    EXPIRATION_DATE: "expirationDate",
    SCROLL_DATA: 'scrollData'
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
function fetch(query, context, forceCache, scroll = false) {
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

        let data = [],
         currentPage = 1,
         startPage = 1,
         updatedQuery = Object.assign({}, query, {scroll}),
         scrollId = null;

        const size = objectPath.get(updatedQuery, service.getSizePath());
        if(scroll) {
            if (!size) {
                updatedQuery = service.updateSize(updatedQuery, config.DATA_PER_PAGE_LIMIT);
            }

            data = getState().services.getIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.RESULTS]);
            data = data || [];

            const scrollData = getState().services.getIn([ActionKeyStore.SCROLL_DATA, updatedQuery.vizID]) || {};

            // Update the requested page
            if(objectPath.has(scrollData, 'page')) {
                currentPage = scrollData.page;
            }

            // Check whether Data is not expired
            if((objectPath.has(scrollData, 'event') && scrollData.event === events.PAGING)
                && (objectPath.has(scrollData, 'expiration') && Date.now() < scrollData.expiration)) {

                // Checking if data already existed for current page in redux store.
                if(data.length >= ((currentPage - 1) * size + 1)) {

                    // Also dispathcing event to say respective event has been handled.
                    dispatch(updateScroll(query.vizID, {
                        event: null,
                        page: currentPage
                    }));

                    return Promise.resolve();
                }

                scrollId = scrollData.scroll_id
                startPage = currentPage;
            } else {
                // Data expired reset it to blank
                data = [];
            }
        }

        // Building query on the basis of page number
        if( startPage !== 1 && scrollId) {
            updatedQuery = service.getScrollQuery(updatedQuery, scrollId);
        }

        dispatch(didStartRequest(requestID));

        return service.fetch(updatedQuery, getState())
            .then(
                async (results) => {
                    data = [...data, ...ServiceManager.tabify(query, results.response)];
                    let nextQuery = scroll ? results.nextQuery : null
                    startPage++;

                    if(nextQuery && nextQuery.query && nextQuery.query.scroll_id) {
                        while(startPage <= currentPage && nextQuery) {
                            let result =   await service.fetch(nextQuery, getState(), data.length)
                            let response = ServiceManager.tabify(query, result.response)

                            if (response && response.length)
                                data = [...data, ...response];

                            nextQuery = result.nextQuery;
                            startPage++;
                        }   
                    }

                    if(scroll) {
                        dispatch(updateScroll(query.vizID, {
                            scroll_id: objectPath.get(nextQuery, 'query.scroll_id'),
                            expiration: Date.now() + config.SCROLL_CACHING_QUERY_TIME,
                            page: startPage - 1,
                            event: null,
                            size: objectPath.get(nextQuery, 'length'),
                            pageSize: size,
                        }))
                    }

                    dispatch(didReceiveResponse(requestID, data, false))

                    return Promise.resolve(data);
            },
            (error) => {
                if (process.env.NODE_ENV === "development" && service.hasOwnProperty("getMockResponse")) {
                    try {
                        const response = service.getMockResponse(query);
                        dispatch(didReceiveResponse(requestID, response, forceCache));
                    } catch(e) {
                        dispatch(didReceiveError(requestID, e));
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

function fetchIfNeeded(query, context, forceCache, scroll) {

    // TODO: Temporary - Replace this part in the middleware
    const isScript = typeof(query) === "string";
    let requestID;

    if (isScript)
        requestID = ServiceManager.getRequestID(query, context);
    else {
        let service = ServiceManager.getService(query.service);
        requestID = service.getRequestID(query, context);
    }

    return (dispatch, getState) => {
        if (!requestID)
            return Promise.reject();

        const state = getState(),
              request = state.services.getIn([ActionKeyStore.REQUESTS, requestID]);

        let mustFetch = false;

        if(scroll) {
            const scrollData = state.services.getIn([ActionKeyStore.SCROLL_DATA, query.vizID]);
            mustFetch = scrollData && scrollData.event || false;
        }

        if (shouldFetch(request) || mustFetch) {
            if (isScript)
                return dispatch(executeScript(query, context));
            else
                return dispatch(fetch(query, context, forceCache, scroll));

        } else {
            return Promise.resolve();
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

function add(query, body, context, forceCache) {
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
        return service.add(query, body, getState())
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

function addIfNeeded(query, body, context, forceCache) {
    const service = ServiceManager.getService(query.service);
    const requestID = service.getRequestID(query, context);

    return (dispatch, getState) => {
        if (!requestID)
            return Promise.reject();

        const state = getState(),
            request = state.services.getIn([ActionKeyStore.REQUESTS, requestID]);

        if (shouldFetch(request)) {
            return dispatch(add(query, body, context, forceCache));
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

function didReceiveResponse(requestID, results, forceCache = false) {
    return {
        type: ActionTypes.SERVICE_MANAGER_DID_RECEIVE_RESPONSE,
        requestID,
        results,
        forceCache
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

function updateScroll(id, data) {
    return {
        type: ActionTypes.SERVICE_MANAGER_SCROLL_DATA,
        id,
        data,
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
    addIfNeeded: addIfNeeded,
    updateScroll: updateScroll,
};
