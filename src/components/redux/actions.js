export const ActionTypes = {
    ACTION_MAIN_MENU_TOGGLE: "ACTION_MAIN_MENU_TOGGLE",
    ACTION_NAV_BAR_SET_TITLE: "ACTION_NAV_BAR_SET_TITLE",
};

export const ActionKeyStore = {
    KEY_STORE_MAIN_MENU_OPENED: "mainMenuOpened",
    KEY_STORE_NAV_BAR_TITLE: "title",
};


export const Actions = {
    toggleMainMenu: function() {
        return {
            type: ActionTypes.ACTION_MAIN_MENU_TOGGLE
        };
    },
    updateTitle: function(aTitle) {
        return {
            type: ActionTypes.ACTION_NAV_BAR_SET_TITLE,
            title: aTitle
        }
    },
};
