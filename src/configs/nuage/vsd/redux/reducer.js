import { Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions";

let initialState = Map() // eslint-disable-line
                    .set(ActionKeyStore.TOKEN, null)
                    .set(ActionKeyStore.API, null)
                    .set(ActionKeyStore.USER_CONTEXT, {});

function setSettings(state, token, API, organization) {
    if (!token && !API)
        return state;

    return state.set(ActionKeyStore.TOKEN, token)
                .set(ActionKeyStore.API, API)
                .set(ActionKeyStore.ORGANIZATION, organization);
}

function updateUserContext(state, userContext) {
    if (!userContext) {
        return state;
    }

    return state.set(ActionKeyStore.USER_CONTEXT, userContext)
}


function VSDReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.VSD_ACTION_SET_SETTINGS:
            return setSettings(state, action.token, action.API, action.organization);
        case ActionTypes.VSD_ACTION_SET_USER_CONTEXT:
            return updateUserContext(state, action.userContext);
        default:
            return state;
    }
};


export default VSDReducer;
