import { Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions";

let initialState = Map() // eslint-disable-line
                    .set(ActionKeyStore.ES_HOST, null);

function setSettings(state, host) {
    if (!host)
        return state;

    return state.set(ActionKeyStore.ES_HOST, host);
}


function ESReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ESHOST_ACTION_SET_SETTINGS:
            return setSettings(state, action.ES_HOST);

        default:
            return state;
    }
};


export default ESReducer;
