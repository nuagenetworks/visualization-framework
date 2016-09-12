import {search} from '../elasticsearch';

export const ActionTypes = {
    ES_SEARCH_REQUEST: "ES_SEARCH_REQUEST",
    ES_SEARCH_SUCCESS: "ES_SEARCH_SUCCESS"
};

export const ActionKeyStore = {
    KEY_STORE_IS_FETCHING: "isFetching",
    KEY_STORE_RESULTS: "results"
};

export const Actions = {

    // This is a thunk action creator that will
    // initiate a request to ElasticSearch.
    fetchSearch: function (){
        return function (dispatch){
            dispatch(Actions.searchRequest);

            search({
                q: 'domains',
            }).then(function () {
                let results = ['domain 1', 'domain 2', 'domain 3'];
                dispatch(Actions.searchResponse(results));
                console.log('ElasticSearch is UP !');

            }, function () {
                dispatch(Actions.searchResponse([]));
                console.error('ElasticSearch cluster is down!');
            });
        }
    },

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
