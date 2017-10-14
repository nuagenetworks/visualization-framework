import { ConfigurationService } from "../../../services/configurations/index";

  export const ActionTypes = {
    REPORT_DID_START_REQUEST: "REPORT_DID_START_REQUEST",
    REPORT_DID_RECEIVE_RESPONSE: "REPORT_DID_RECEIVE_RESPONSE",
    REPORT_DID_RECEIVE_ERROR: "REPORT_DID_RECEIVE_ERROR"
  };

  export const ActionKeyStore = {

    DATA: "data",
    ERROR: "error",
    IS_FETCHING: "isFetching",
    REPORT_EXPIRATION_DATE: "reportExpirationDate"

  };
   function fetchIfNeeded(configUrl) {

	return (dispatch, getState) => {
        return dispatch(fetchReports(configUrl));
	}
  }

  function fetchReports(configUrl) {

    if(!configUrl) {
        throw new Error("Config url argument must be specified.");
    }

    return (dispatch) => {
        dispatch(didStartRequest(configUrl));

        return ConfigurationService.processRequest(configUrl)
            .then((response) => {
                dispatch(didReceiveResponse(configUrl, response));
                return Promise.resolve(response);
        })
        .catch((error) => {
                dispatch(didReceiveError(configUrl, error.message));
                return Promise.resolve();
        });
    }

  };


  function deleteReports(configUrl) {
    
        if(!configUrl) {
            throw new Error("Config url argument must be specified.");
        }
    
        return (dispatch) => {
            dispatch(didStartRequest(configUrl));
    
            return ConfigurationService.processRequest(configUrl)
                .then((response) => {
                    dispatch(didReceiveResponse(configUrl, response));
                    return Promise.resolve(response);
            })
            .catch((error) => {
                    dispatch(didReceiveError(configUrl, error.message));
                    return Promise.resolve();
            });
        }
    
  };

  function generateNewReport(configUrl, method) {
    
        if(!configUrl) {
            throw new Error("Config url argument must be specified.");
        }
    
        return (dispatch) => {
            dispatch(didStartRequest(configUrl));
    
            return ConfigurationService.processRequest(configUrl, method)
                .then((response) => {
                    dispatch(didReceiveResponse(configUrl, response));
                    return Promise.resolve(response);
            })
            .catch((error) => {
                    dispatch(didReceiveError(configUrl, error.message));
                    return Promise.resolve();
            });
        }
  };

  function updateDataSet(configUrl, method, params) {
    if(!configUrl) {
        throw new Error("Config url argument must be specified.");
    }

    return (dispatch) => {
        dispatch(didStartRequest(configUrl));

        return ConfigurationService.processRequest(configUrl, method, params)
            .then((response) => {
                dispatch(didReceiveResponse(configUrl, response));
                return Promise.resolve(response);
        })
        .catch((error) => {
                dispatch(didReceiveError(configUrl, error.message));
                return Promise.resolve();
        });
    }
  }

  function didStartRequest(configUrl) {
    return {
        type: ActionTypes.REPORT_DID_START_REQUEST,
        configUrl: configUrl
    };
  };

  function didReceiveResponse (configUrl, data) {
    return {
        type: ActionTypes.REPORT_DID_RECEIVE_RESPONSE,
        configUrl: configUrl,
        data: data.results
    };
  };

 function didReceiveError (configUrl, error) {
    return {
        type: ActionTypes.REPORT_DID_RECEIVE_ERROR,
        configUrl: configUrl,
        error: error
    };
  }

  export const Actions = {
    fetchReports,
    didStartRequest,
    didReceiveResponse,
    didReceiveError,
    fetchIfNeeded,
    deleteReports,
    generateNewReport,
    updateDataSet
  }
