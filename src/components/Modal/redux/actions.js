import { ServiceManager } from "../index"
import { VSDService } from "../../../configs/nuage/vsd"

export const ActionTypes = {
    MODAL_DIALOG_DID_START_REQUEST: "MODAL_DIALOG_DID_START_REQUEST",
    MODAL_DIALOG_DID_RECEIVE_RESPONSE: "MODAL_DIALOG_DID_RECEIVE_RESPONSE",
    MODAL_DIALOG_DID_RECEIVE_ERROR: "MODAL_DIALOG_DID_RECEIVE_ERROR"
};

export const ActionKeyStore = {
    MODAL_DIALOG: "modalDialog",
    ERROR: "error",
    IS_FETCHING: "isFetching",
    RESULTS: "results"
};

function fetchIfNeeded(query, row) {

    return (dispatch, getState) => {
        dispatch(didStartRequest(row));

        return VSDService.fetch(query, getState())
            .then(
            (results) => {
                dispatch(didReceiveResponse(row, results));
                return Promise.resolve(results);
            },
            (error) => {
                dispatch(didReceiveError(row, error));
                return Promise.resolve();
            });
    }
}

function didStartRequest(row) {
    return {
        type: ActionTypes.MODAL_DIALOG_DID_START_REQUEST,
        row: row,
    };
}

function didReceiveResponse(row, results) {
    return {
        type: ActionTypes.MODAL_DIALOG_DID_RECEIVE_RESPONSE,
        row: row,
        results: results,
    };
}

function didReceiveError(row, error) {
    return {
        type: ActionTypes.MODAL_DIALOG_DID_RECEIVE_ERROR,
        row: row,
        error: error
    };
}

export const Actions = {
    fetchIfNeeded: fetchIfNeeded,
    didStartRequest: didStartRequest,
    didReceiveResponse: didReceiveResponse,
    didReceiveError: didReceiveError
};
