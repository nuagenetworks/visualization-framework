import { fetchConfiguration } from '../index';

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

export const Actions = {
    
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
    fetch: function (id, configType) {

        if(!configType){
            throw new Error("configType argument must be specified.");
        }

        return function (dispatch){
            dispatch(Actions.didStartRequest(id, configType));

            // Important: It is essential for redux to return a promise in order
            // to test this method (See: http://redux.js.org/docs/recipes/WritingTests.html)
            return fetchConfiguration(id)
                .then(function (data) {
                    dispatch(Actions.didReceiveResponse(id, configType, data));
                })
                .catch(function (error) {
                    dispatch(Actions.didReceiveError(id, error.message));
                });
        }
    },
    didStartRequest: function(id, configType) {
        return {
            type: ActionTypes.CONFIG_DID_START_REQUEST,
            id: id,
            configType: configType
        };
    },
    didReceiveResponse: function(id, configType, data) {
        return {
            type: ActionTypes.CONFIG_DID_RECEIVE_RESPONSE,
            id: id,
            configType: configType,
            data: data
        };
    },
    didReceiveError: function(id, error) {
        return {
            type: ActionTypes.CONFIG_DID_RECEIVE_ERROR,
            id: id,
            error: error
        };
    },
};
