import { Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions"


let initialState = Map(); // eslint-disable-line
initialState = initialState.set(ActionKeyStore.KEY_STORE_MAIN_MENU_OPENED, false);
initialState = initialState.set(ActionKeyStore.KEY_STORE_NAV_BAR_TITLE, "");
initialState = initialState.set(ActionKeyStore.KEY_STORE_MESSAGE_BOX_OPENED, Map()); // eslint-disable-line


function toggleMainMenu(state) {
    return state.set(ActionKeyStore.KEY_STORE_MAIN_MENU_OPENED,  !state.get(ActionKeyStore.KEY_STORE_MAIN_MENU_OPENED));
}


function setTitle(state, aTitle) {
    return state.set(ActionKeyStore.KEY_STORE_NAV_BAR_TITLE,  aTitle);
}


function interfaceReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ACTION_MAIN_MENU_TOGGLE:
            return toggleMainMenu(state);

        case ActionTypes.ACTION_NAV_BAR_SET_TITLE:
            return setTitle(state, action.title);

        default:
            return state;
    }

};


export default interfaceReducer;
