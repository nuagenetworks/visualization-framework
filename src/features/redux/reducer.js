import { Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions"


let initialState = Map() // eslint-disable-line
                    .set(ActionKeyStore.SELECTED_ROW, Map());

function selectRow(state, id, data, parentQuery, parentPathname) {
    if (!state.hasIn([ActionKeyStore.SELECTED_ROW, id])) {
        state = state.setIn([ActionKeyStore.SELECTED_ROW, id], Map());
    }
    return state.setIn([ActionKeyStore.SELECTED_ROW, id, ActionKeyStore.SELECTED_ROW_DATA], data)
                .setIn([ActionKeyStore.SELECTED_ROW, id, ActionKeyStore.SELECTED_ROW_PARENT_QUERY], parentQuery)
                .setIn([ActionKeyStore.SELECTED_ROW, id, ActionKeyStore.SELECTED_ROW_PARENT_PATHNAME], parentPathname);
}

function VFSReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ACTION_SELECT_ROW:
            return selectRow(state, action.id, action.data, action.parentQuery, action.parentPath);
        case ActionTypes.ACTION_RESET_ROW:
            return selectRow(state, action.id, {}, {}, null);
        default:
            return state;
    }
};

export default VFSReducer;
