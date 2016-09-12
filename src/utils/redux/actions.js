export const ActionTypes = {
    ES_SEARCH_REQUEST: "ES_SEARCH_REQUEST",
    ES_SEARCH_SUCCESS: "ES_SEARCH_SUCCESS"
};

export const ActionKeyStore = {
    KEY_STORE_IS_FETCHING: "isFetching",
    KEY_STORE_RESULTS: "results"
};

export const Actions = {
    searchRequest: function() {
        return {
            type: ActionTypes.ES_SEARCH_REQUEST
        };
    },
    searchResponse: function(results) {
        return {
            type: ActionTypes.ES_SEARCH_SUCCESS,
            results: results
        };
    }
};
