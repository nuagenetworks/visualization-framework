import { Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions"


let initialState = Map(); // eslint-disable-line
initialState = initialState.set(ActionKeyStore.VFS_SELECTED_FLOW_DATA, {});
initialState = initialState.set(ActionKeyStore.VFS_SELECTED_FLOW_PARENT_QUERY, {});
initialState = initialState.set(ActionKeyStore.VFS_SELECTED_FLOW_PARENT_PATHNAME, null);

function selectFlow(state, data, parentQuery, parentPathname) {
    return state.set(ActionKeyStore.VFS_SELECTED_FLOW_DATA, data)
                .set(ActionKeyStore.VFS_SELECTED_FLOW_PARENT_QUERY, parentQuery)
                .set(ActionKeyStore.VFS_SELECTED_FLOW_PARENT_PATHNAME, parentPathname);
}

function VFSReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ACTION_VFS_SELECT_FLOW:
            return selectFlow(state, action.data, action.parentQuery, action.parentPath);
        case ActionTypes.ACTION_VFS_RESET_FLOW:
            return selectFlow(state, {}, {}, null);
        default:
            return state;
    }

};

export default VFSReducer;
