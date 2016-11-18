export const ActionTypes = {
    ESHOST_ACTION_SET_SETTINGS: "ESHOST_ACTION_SET_SETTINGS",
};

export const ActionKeyStore = {
    ES_HOST: "eshost"
};

export const Actions = {
    setSettings: function(ES_HOST) {
        return {
            type: ActionTypes.ESHOST_ACTION_SET_SETTINGS,
            ES_HOST: ES_HOST
        }
    }
};
