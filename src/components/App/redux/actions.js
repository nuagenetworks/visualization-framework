export const ActionTypes = {
    ACTION_MAIN_MENU_TOGGLE: "ACTION_MAIN_MENU_TOGGLE",
    ACTION_NAV_BAR_SET_TITLE: "ACTION_NAV_BAR_SET_TITLE",
    ACTION_NAV_BAR_SET_TITLE_ICON: "ACTION_NAV_BAR_SET_TITLE_ICON",
    ACTION_UPDATE_CONTEXT: "ACTION_UPDATE_CONTEXT",
    ACTION_RESET_CONTEXT: "ACTION_RESET_CONTEXT",
    PENDING_DASHBOARD_CONTEXT: "PENDING_DASHBOARD_CONTEXT",
    ACTION_UPDATE_VISUALIZATION_TYPE: "ACTION_UPDATE_VISUALIZATION_TYPE",
    ACTION_NAV_BAR_HAS_LINKS: "ACTION_NAV_BAR_HAS_LINKS",
    ACTION_UPDATE_HEADER_COLOR: "ACTION_UPDATE_HEADER_COLOR",
    ACTION_UPDATE_PAGE: "ACTION_UPDATE_PAGE",
};

export const ActionKeyStore = {
    MAIN_MENU_OPENED: "mainMenuOpened",
    NAV_BAR_TITLE: "title",
    NAV_BAR_TITLE_ICON: "titleIcon",
    CONTEXT: "context",
    VISUALIZATION_TYPE: "visualizationType",
    HEADERCOLOR: "headerColor",
    UPDATEPAGE: "updatePage"
};


export const Actions = {
    toggleMainMenu: () => {
        return {
            type: ActionTypes.ACTION_MAIN_MENU_TOGGLE
        };
    },
    updateTitle: (aTitle) => {
        return {
            type: ActionTypes.ACTION_NAV_BAR_SET_TITLE,
            title: aTitle
        }
    },
    updateTitleIcon: (aTitleIcon) => {
        return {
            type: ActionTypes.ACTION_NAV_BAR_SET_TITLE_ICON,
            titleIcon: aTitleIcon
        }
    },
    updateContext: (aContext) => {
        return {
            type: ActionTypes.ACTION_UPDATE_CONTEXT,
            context: aContext
        }
    },
    resetContext: (aContext) => {
        return {
            type: ActionTypes.ACTION_RESET_CONTEXT,
            context: aContext
        }
    },
    updateVisualizationType: (aVisualisationType) => {
        return {
            type: ActionTypes.ACTION_UPDATE_VISUALIZATION_TYPE,
            visualizationType: aVisualisationType
        }
    },

    setHasLinks: (hasLinks) => {
        return {
            type: ActionTypes.ACTION_NAV_BAR_HAS_LINKS,
            hasLinks: hasLinks
        }
    },

    updateHeaderColor: (id, color) => {
        return {
            type: ActionTypes.ACTION_UPDATE_HEADER_COLOR,
            id: id,
            color: color
        }
    },

    updatePage: (id) => {
        return {
            type: ActionTypes.ACTION_UPDATE_PAGE,
            id: id
        }
    },
};
