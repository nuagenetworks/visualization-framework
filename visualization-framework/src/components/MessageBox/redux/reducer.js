import {List, Map} from "immutable";
import {ActionTypes, ActionKeyStore} from "./actions"


let initialState = Map(); // eslint-disable-line
initialState = initialState.set(ActionKeyStore.MESSAGE_BOX_OPENED, false);
initialState = initialState.set(ActionKeyStore.MESSAGE_BOX_TITLE, null);
initialState = initialState.set(ActionKeyStore.MESSAGE_BOX_BODY, null);
initialState = initialState.set(ActionKeyStore.MESSAGE_BOX_BUTTONS, List()); // eslint-disable-line


function toggleMessageBox(state, opened, title, body, buttons) {
    return state.set(ActionKeyStore.MESSAGE_BOX_OPENED, opened)
                .set(ActionKeyStore.MESSAGE_BOX_TITLE, title)
                .set(ActionKeyStore.MESSAGE_BOX_BODY, body)
                .set(ActionKeyStore.MESSAGE_BOX_BUTTONS, buttons);
}

function messageBoxReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ACTION_MESSAGE_BOX_TOGGLE:
            return toggleMessageBox(state, action.opened, action.title, action.body, action.buttons);

        default:
            return state;
    }

};

export default messageBoxReducer;
