export const ActionTypes = {
    ACTION_SELECT_ROW: "ACTION_SELECT_ROW",
    ACTION_RESET_ROW: "ACTION_RESET_ROW",
};

export const ActionKeyStore = {
    SELECTED_ROW_DATA: 'data',
    SELECTED_MATCHED_ROW_DATA: 'matchedRows',
    SELECTED_ROW_PARENT_QUERY: 'parentQuery',
    SELECTED_ROW_PARENT_PATHNAME: 'parentPath',
    SELECTED_ROW: 'rows',
};


export const Actions = {
    selectRow: (id, data, matchedRows, parentQuery, parentPath) => {
        return {
            type: ActionTypes.ACTION_SELECT_ROW,
            data: data,
            matchedRows: matchedRows,
            id,
            parentQuery: parentQuery,
            parentPath: parentPath,
        };
    },
};
