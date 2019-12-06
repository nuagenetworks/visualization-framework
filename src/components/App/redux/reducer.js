import { Map } from "immutable";
import { ActionTypes, ActionKeyStore } from "./actions"
import _object from 'lodash/object';

let initialState = Map(); // eslint-disable-line
initialState = initialState.set(ActionKeyStore.MAIN_MENU_OPENED, false);
initialState = initialState.set(ActionKeyStore.NAV_BAR_TITLE, "");
initialState = initialState.set(ActionKeyStore.NAV_BAR_TITLE_ICON, false);
initialState = initialState.set(ActionKeyStore.CONTEXT, {});
initialState = initialState.set(ActionKeyStore.FILTER_CONTEXT, {});
initialState = initialState.set(ActionKeyStore.HASLINKS, false);
initialState = initialState.set(ActionKeyStore.HEADERCOLOR, Map());
initialState = initialState.set(ActionKeyStore.UPDATEPAGE, "");
initialState = initialState.set(ActionKeyStore.CUSTOM_FILTER, {});

function toggleMainMenu(state) {
    return state.set(ActionKeyStore.MAIN_MENU_OPENED,  !state.get(ActionKeyStore.MAIN_MENU_OPENED));
}

function setTitle(state, aTitle) {
    return state.set(ActionKeyStore.NAV_BAR_TITLE,  aTitle);
}

function setTitleIcon(state, aTitleIcon) {
    return state.set(ActionKeyStore.NAV_BAR_TITLE_ICON,  aTitleIcon);
}

function setCustomFilterContext(state, aFilter) {
    return state.set(ActionKeyStore.CUSTOM_FILTER, aFilter);  
}

function updateContext(state, aContext) {
    let currentContext = state.get(ActionKeyStore.CONTEXT);
    return state.set(ActionKeyStore.CONTEXT,  Object.assign({}, currentContext, aContext));
}

function filterContext(state, aContext) {
    let currentContext = state.get(ActionKeyStore.FILTER_CONTEXT);
    return state.set(ActionKeyStore.FILTER_CONTEXT, Object.assign({}, currentContext, aContext));
}

function updateVisualizationType(state, aType) {
    return state.set(ActionKeyStore.VISUALIZATION_TYPE, aType);
}

function setHasLinks(state, hasLinks) {
    return state.set(ActionKeyStore.HASLINKS,  hasLinks);
}

function updateHeaderColor(state, action) {
    return state.setIn([ActionKeyStore.HEADERCOLOR, action.id], action.color);
}

function updatePage(state, action) {
    return state.set(ActionKeyStore.UPDATEPAGE, action.id);
}

function interfaceReducer(state = initialState, action) {

    switch (action.type) {
        case ActionTypes.ACTION_MAIN_MENU_TOGGLE:
            return toggleMainMenu(state);

        case ActionTypes.ACTION_NAV_BAR_SET_TITLE:
            return setTitle(state, action.title);

        case ActionTypes.ACTION_NAV_BAR_SET_TITLE_ICON:
            return setTitleIcon(state, action.titleIcon);

        case ActionTypes.ACTION_UPDATE_CONTEXT:
            return updateContext(state, action.context);

        case ActionTypes.ACTION_UPDATE_CUSTOM_FILTER:
            return setCustomFilterContext(state, action.customFilter);

        case ActionTypes.ACTION_FILTER_CONTEXT:
            return filterContext(state, action.context);

        case ActionTypes.ACTION_UPDATE_VISUALIZATION_TYPE:
            return updateVisualizationType(state, action.visualizationType);

        case ActionTypes.ACTION_NAV_BAR_HAS_LINKS:
            return setHasLinks(state, action.hasLinks);

        case ActionTypes.ACTION_UPDATE_HEADER_COLOR:
            return updateHeaderColor(state, action);

        case ActionTypes.ACTION_UPDATE_PAGE:
            return updatePage(state, action);

        default:
            return state;
    }

};


export default interfaceReducer;
