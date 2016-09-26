import { fetchConfiguration } from "../index";

export const ActionTypes = {
    CONFIG_DID_START_REQUEST: "CONFIG_DID_START_REQUEST",
    CONFIG_DID_RECEIVE_RESPONSE: "CONFIG_DID_RECEIVE_RESPONSE",
    CONFIG_DID_RECEIVE_ERROR: "CONFIG_DID_RECEIVE_ERROR",
};

export const ActionKeyStore = {

    DATA: "data",
    ERROR: "error",
    IS_FETCHING: "isFetching",

    /*
      The following keys correspond to the various
      kinds of configurations that can be loaded.

      They correspond to the directories from which
      the configuration files will be fetched.
    */
    DASHBOARDS: "dashboards",
    VISUALIZATIONS: "visualizations",
    QUERIES: "queries"
};

/*
  This thunk action creator will fetch the specified configuration.
  Arguments:
   * id - The identifier of the configuration, corresponding to the file name.
   * configType - Specifies what kind of configuration to fetch.
     The value must be one of the following:

        ActionKeyStore.DASHBOARDS
        ActionKeyStore.VISUALIZATIONS
        ActionKeyStore.QUERIES
*/
function fetch (id, configType) {

    if(!configType){
        throw new Error("configType argument must be specified.");
    }

    return function (dispatch) {
        dispatch(didStartRequest(id, configType));

        // Important: It is essential for redux to return a promise in order
        // to test this method (See: http://redux.js.org/docs/recipes/WritingTests.html)
        return fetchConfiguration(id, configType)
            .then(function (configuration) {
                dispatch(didReceiveResponse(id, configType, configuration));
            })
            .catch(function (error) {
                dispatch(didReceiveError(id, configType, error.message));
            });

            // TODO move this logic to the approproate place.
            //  dispatch(ElasticSearchActions.fetch(id, configuration, context));
    }
};

function shouldFetch(state, id, configType){
    const configuration = state.configurations.getIn([
        configType,
        id
    ]);
    if(!configuration){
        return true;
    } else {
        return false;
    }
}

function fetchIfNeeded(id, configType){ 
    return function (dispatch, getState) {
        if (shouldFetch(getState(), id, configType)){
            return dispatch(fetch(id, configType));
        } else {
            return Promise.resolve();
        }
    }
} 

function didStartRequest (id, configType) {
    return {
        type: ActionTypes.CONFIG_DID_START_REQUEST,
        id: id,
        configType: configType
    };
};
function didReceiveResponse (id, configType, data) {
    return {
        type: ActionTypes.CONFIG_DID_RECEIVE_RESPONSE,
        id: id,
        configType: configType,
        data: data
    };
};
function didReceiveError (id, configType, error) {
    return {
        type: ActionTypes.CONFIG_DID_RECEIVE_ERROR,
        id: id,
        configType: configType,
        error: error
    };
};

export const Actions = {
    fetch,
    fetchIfNeeded,
    didStartRequest,
    didReceiveResponse,
    didReceiveError
};
