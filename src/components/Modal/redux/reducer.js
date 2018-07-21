// TODO: Create a Visualization component
import { Map } from 'immutable';
import { ActionTypes, ActionKeyStore } from './actions';

let initialState = Map()
    .set(ActionKeyStore.MODAL_DIALOG, Map())


function didStartRequest(state, row) {
    return state.setIn([ActionKeyStore.MODAL_DIALOG, row, ActionKeyStore.IS_FETCHING], true)
                .setIn([ActionKeyStore.MODAL_DIALOG, row, ActionKeyStore.ERROR], null);
}

function didReceiveResponse(state, row, results) {
    return state
      .setIn([ActionKeyStore.MODAL_DIALOG, row, ActionKeyStore.IS_FETCHING], false)
      .setIn([ActionKeyStore.MODAL_DIALOG, row, ActionKeyStore.RESULTS], results)}

function didReceiveError(state, row, error) {
    return state
        .setIn([ActionKeyStore.MODAL_DIALOG, row, ActionKeyStore.IS_FETCHING], false)
        .setIn([ActionKeyStore.MODAL_DIALOG, row, ActionKeyStore.ERROR], error)
        .setIn([ActionKeyStore.MODAL_DIALOG, row, ActionKeyStore.RESULTS], []);
}

function modalDialog(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.MODAL_DIALOG_DID_START_REQUEST:
            return didStartRequest(state, action.row);

        case ActionTypes.MODAL_DIALOG_DID_RECEIVE_RESPONSE:
            return didReceiveResponse(state, action.row, action.results);

        case ActionTypes.MODAL_DIALOG_DID_RECEIVE_ERROR:
            return didReceiveError(state, action.row, action.error);

        default:
            return state;
    }

};


export default modalDialog;
