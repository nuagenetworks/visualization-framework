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
    SERVICE_MANAGER_SCROLL_DATA: "SERVICE_MANAGER_SCROLL_DATA",
    SERVICE_MANAGER_RESET_SERVICES: "SERVICE_MANAGER_RESET_SERVICES"
};

export const ActionKeyStore = {
    ERROR: "error",
    IS_FETCHING: "isFetching",
    RESULTS: "results",
    REQUESTS: "requests",
    EXPIRATION_DATE: "expirationDate",
    SCROLL_DATA: 'scrollData',
    DASHBOARD: 'dashboard'
};

// TODO: Temporary - Replace this part in the middleware
function executeScript(scriptName, context, dashboard = null) {

    const requestID = ServiceManager.getRequestID(scriptName, context);

    return (dispatch, getState) => {
        dispatch(didStartRequest(requestID, dashboard));

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

function isPagingEvent(scrollData) {
    return objectPath.has(scrollData, 'event') && scrollData.event === events.PAGING;
}

function isScrollValid(scrollData) {
    return objectPath.has(scrollData, 'expiration') && Date.now() < scrollData.expiration;
}

function isRefreshEvent(scrollData) {
    return objectPath.has(scrollData, 'event') && scrollData.event === events.REFRESH;
}

function getScrollStatus({
    scrollData,
    total,
    pageSize
}) {
    // Check whether Data is not expired
    const isValidData = isPagingEvent(scrollData) && isScrollValid(scrollData);
    const currentPage = objectPath.get(scrollData, 'page') || 1;

    if(!isValidData || isRefreshEvent())
        return 'INVALID';

    if(total >= ((currentPage - 1) * pageSize + 1)) {
        return 'EXISTS';
    }

    return 'NOT_EXISTS'
}

async function getDataFromStartToCurrentPage({
    data,
    query,
    results,
    startPage,
    currentPage,
    state
}) {
    let service = ServiceManager.getService(query.service);
    let records = [...data];

    let nextQuery = results.nextQuery;

    while(nextQuery && startPage <= currentPage) {
        let result =   await service.fetch(nextQuery, state, records.length)
        let response = ServiceManager.tabify(query, result.response)

        if (response && response.length)
            records = [...records, ...response];

        nextQuery = result.nextQuery;
        startPage++;
    }

    return {
        data,
        nextQuery
    }
}

/*
    Make a query on the service based on the service name.

    Arguments:
    * query: the query configuration
    * context: the context if the query should be parameterized
    * forceCache: a boolean to force storing the value for a long period
*/
function fetch(query, context, forceCache, scroll = false, dashboard = null) {
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

        const scrollData = getState().services.getIn([ActionKeyStore.SCROLL_DATA, query.vizID]) || {};

        let data = [],
            currentPage = objectPath.get(scrollData, 'page') || 1,
            startPage = currentPage,
            updatedQuery = { ...query, scroll },
            scrollId = null,
            pageSize = objectPath.get(updatedQuery, service.getSizePath());

        if(scroll) {
            if (!pageSize) {
                // Set the size for VSD / ES query for pagination purpose.
                updatedQuery = service.updateSize(updatedQuery, config.DATA_PER_PAGE_LIMIT);
            }

            data = getState().services.getIn([ActionKeyStore.REQUESTS, requestID, ActionKeyStore.RESULTS]) || [];

            const status = getScrollStatus({
                scrollData,
                total: data.length,
                pageSize
            });

            switch (status) {
                case 'INVALID':
                    // Reset data and start from first page
                    data = [];
                    startPage = 1;
                    break;

                case 'NOT_EXISTS':
                    // Fetch next page
                    scrollId = scrollData.scroll_id
                    break;

                case 'EXISTS':
                    // Data already Preset no need to do request
                    dispatch(updateScroll(query.vizID, {
                        event: null,
                        page: currentPage
                    }));

                    return Promise.resolve();
            }
        }

        // If Page number is not equal to 1 then we must use Scroll Base Query else use normal Query
        updatedQuery = startPage !== 1 ? service.getScrollQuery(updatedQuery, scrollId) : updatedQuery;
        dispatch(didStartRequest(requestID, dashboard));

        return service.fetch(updatedQuery, getState())
            .then(
                async (results) => {
                    // merging "data" here for the case of paging, otherwise will be []
                    data = [...data, ...ServiceManager.tabify(query, results.response)];

                    if(scroll) {
                        startPage++;

                        // Will be valid in case of scroll get expired
                        const response = await getDataFromStartToCurrentPage({
                            data,
                            query,
                            results,
                            startPage,
                            currentPage,
                            state: getState()
                        })

                        data = response.data;

                        dispatch(updateScroll(
                            query.vizID,
                            {
                                scroll_id: objectPath.get(response.nextQuery, 'query.scroll_id'),
                                expiration: Date.now() + config.SCROLL_CACHING_QUERY_TIME,
                                event: null,
                                size: objectPath.get(response.nextQuery, 'length'),
                                pageSize,
                            }
                        ))
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

function fetchIfNeeded(query, context, forceCache, scroll, dashboard = null) {

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
                return dispatch(executeScript(query, context, dashboard));
            else
                return dispatch(fetch(query, context, forceCache, scroll, dashboard));

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

function didStartRequest(requestID, dashboard = null) {
    return {
        type: ActionTypes.SERVICE_MANAGER_DID_START_REQUEST,
        requestID: requestID,
        dashboard
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
