import { search } from '../index';

export const ActionTypes = {
    ES_DID_START_REQUEST: "ES_DID_START_REQUEST",
    ES_DID_RECEIVE_RESPONSE: "ES_DID_RECEIVE_RESPONSE",
    ES_DID_RECEIVE_ERROR: "ES_DID_RECEIVE_ERROR",
};

export const ActionKeyStore = {
    ERROR: "error",
    IS_FETCHING: "isFetching",
    RESULTS: "results",
    REQUESTS: "requests",
};


/*
  Computes the ElasticSearch query according to a configuration and a context.

  It replaces the terms in the configuration by the information that matches in the context.

  If no information matches, it returns the configuration for now.
  TODO: Let's see if we need to throw an exception here.

  Arguments:
   * id - The identifier of the query configuration, corresponding to the file name.
   * configuration - The query configuration that has been found and set in the state
   * context - Object that specifies the context
    Example:
    let context = {
        enterpriseName: "my-company-name"
    }
*/
const computeQuery = function (id, configuration, context) {
    let query = configuration;

    if (!query.aggs)
        return query;

    let aggsKeys = Object.keys(query.aggs);

    if (!aggsKeys.length)
        return query

    let key = aggsKeys[0],
        filters = query.aggs[key].filters.filters;

    if (!filters)
        return query;

    let filterKey, contextKey;

    for (filterKey in filters) {
        if (filters.hasOwnProperty(filterKey)) {
            for (contextKey in context) {
                if (contextKey in filters[filterKey].query.term)
                    filters[filterKey].query.term[contextKey] = escape(context[contextKey]);
            }
        }
    }

    return query
}

/*
  Computes a request ID based on a configuration identifier and a context.

  Arguments:
   * id - The identifier of the query configuration, corresponding to the file name.
   * context - Object that specifies the context
    Example:
    let context = {
        enterpriseName: "my-company-name"
    }

  Returns:
    Suggested Implementation will return a request ID with the following format:
        >> identifier/key1=value1[/key2=value2]

*/
export const getRequestID = function (id, context) {
    let requestID = id,
        key;

    for (key in context) {
        if (context.hasOwnProperty(key)) {
            var value = context[key];
            requestID += "/" + key + "=" + value;
        }
    }

    return requestID;
}


export const Actions = {

    // This is a thunk action creator that will
    // initiate a request to ElasticSearch.
    fetch: function (id, configuration, context) {

        let query = computeQuery(id, configuration, context);

        return function (dispatch) {
            let requestID = getRequestID(id, context);

            dispatch(Actions.didStartRequest(requestID));

            return search(query)
            .then(function (results) {
                dispatch(Actions.didReceiveResponse(requestID, results));

            }, function (error) {
                dispatch(Actions.didReceiveError(requestID, error));
            });
        }
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
