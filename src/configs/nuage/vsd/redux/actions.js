export const ActionTypes = {
    VSD_ACTION_SET_SETTINGS: "VSD_ACTION_SET_SETTINGS",
    VSD_ACTION_SET_USER_CONTEXT: "VSD_ACTION_SET_USER_CONTEXT",
};

export const ActionKeyStore = {
    TOKEN: "token",
    API: "api",
    ORGANIZATION: "organization",
    USER_CONTEXT: "userContext"
};

export const Actions = {
    setSettings: function(token, API, organization) {
        return {
            type: ActionTypes.VSD_ACTION_SET_SETTINGS,
            token: token,
            API: API,
            organization: organization
        }
    },
    updateUserContext: (userContext) => {
        return {
            type: ActionTypes.VSD_ACTION_SET_USER_CONTEXT,
            userContext
        }
    }
};
