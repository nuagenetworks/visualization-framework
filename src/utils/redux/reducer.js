import {Map} from 'immutable';
import {ActionTypes, ActionKeyStore} from './actions'

let initialState = Map(); // eslint-disable-line
initialState = initialState.set(ActionKeyStore.KEY_STORE_IS_FETCHING, false);
initialState = initialState.set(ActionKeyStore.KEY_STORE_RESULTS, []);


function requestSearch(state) {
    return state.set(ActionKeyStore.KEY_STORE_IS_FETCHING, true);
}


function elasticsearchReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ES_SEARCH_REQUEST:
            return requestSearch(state);

        //case ActionTypes.ES_SEARCH_SUCCESS:
        //    return receiveResults(state, action.results);

        default:
            return state;
    }

};


export default elasticsearchReducer;
