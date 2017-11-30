export const ActionTypes = {
    ACTION_VFS_SELECT_FLOW: "ACTION_VFS_SELECT_FLOW",
    ACTION_VFS_RESET_FLOW: "ACTION_VFS_RESET_FLOW"
};

export const ActionKeyStore = {
    VFS_SELECTED_FLOW_DATA: 'data',
    VFS_SELECTED_FLOW_PARENT_QUERY: 'parentQuery',
    VFS_SELECTED_FLOW_PARENT_PATHNAME: 'parentPath',
};


export const Actions = {
    selectFlow: (data, parentQuery, parentPath) => {
        return {
            type: ActionTypes.ACTION_VFS_SELECT_FLOW,
            data: data,
            parentQuery: parentQuery,
            parentPath: parentPath,
        };
    },
};
