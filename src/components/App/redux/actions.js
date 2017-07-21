export const ActionTypes = {
    ACTION_MAIN_MENU_TOGGLE: "ACTION_MAIN_MENU_TOGGLE",
    ACTION_NAV_BAR_SET_TITLE: "ACTION_NAV_BAR_SET_TITLE",
    ACTION_NAV_BAR_SET_TITLE_ICON: "ACTION_NAV_BAR_SET_TITLE_ICON",
    ACTION_UPDATE_CONTEXT: "ACTION_UPDATE_CONTEXT",
    ACTION_UPDATE_VISUALIZATION_TYPE: "ACTION_UPDATE_VISUALIZATION_TYPE",
    ACTION_NAV_BAR_HAS_LINKS: "ACTION_NAV_BAR_HAS_LINKS",
};

export const ActionKeyStore = {
    MAIN_MENU_OPENED: "mainMenuOpened",
    NAV_BAR_TITLE: "title",
    NAV_BAR_TITLE_ICON: "titleIcon",
    CONTEXT: "context",
    VISUALIZATION_TYPE: "visualizationType",
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
};
