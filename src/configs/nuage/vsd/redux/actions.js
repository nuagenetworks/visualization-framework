export const ActionTypes = {
    VSD_ACTION_SET_SETTINGS: "VSD_ACTION_SET_SETTINGS",
};

export const ActionKeyStore = {
    TOKEN: "token",
    API: "api",
};

export const Actions = {
    setSettings: function(token, API) {
        return {
            type: ActionTypes.VSD_ACTION_SET_SETTINGS,
            token: token,
            API: API
        }
    }
};
