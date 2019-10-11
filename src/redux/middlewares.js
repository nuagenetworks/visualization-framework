import { ActionKeyStore } from "../components/App/redux/actions";
import { ActionTypes } from "../services/servicemanager/redux/actions";
import queryString from "query-string";

// TODO: We need to find a way to plug middlewares like this one.
// as it is very specific to Nuage features (VSS or AAR)
export const updateVisualizationTypeMiddleware = store => next => action => {
    const result = next(action),
          state  = store.getState();
    if (action.type === "@@router/LOCATION_CHANGE" && state.router && state.router.action !== 'pop' && state.router.location.search && state.router.location.pathname.indexOf('dashboards') !== -1)
    {
        const id           = state.router.location.pathname.split('dashboards/')[1],
              previousType = state.interface.get("visualizationType"),
              nextType     = id && id.length > 3 ? id.substr(0, 3).toUpperCase() : null;

        if (nextType && nextType !== previousType) {
            const action = {
                type: "ACTION_UPDATE_VISUALIZATION_TYPE",
                visualizationType: nextType
            };
            store.dispatch(action);
        }
    }

    return result;
}

export const updateContextMiddleware = store => next => action => {
    const result = next(action),
          state  = store.getState();

    if (action.type === "@@router/LOCATION_CHANGE" && state.router) {
        let context = queryString.parse(state.router.location.search)
        if((state.router.location.pathname.indexOf('dashboards') !== -1
            || state.router.location.pathname.indexOf('visualizations') !== -1))
        {
            const id           = state.router.location.pathname.split('visualizations/')[1],
                previousPage = state.interface.get(ActionKeyStore.UPDATEPAGE);

            if(!previousPage || previousPage !== id ) {

                store.dispatch({
                        type: "ACTION_UPDATE_PAGE",
                        id: id
                });

                store.dispatch({
                        type: "RESET_CONFIGURATION",
                });

                store.dispatch({
                    type: ActionTypes.SERVICE_MANAGER_RESET_SERVICES,
                    dashboard: previousPage
                });
            }
        }

        const action = {
            type: "ACTION_UPDATE_CONTEXT",
            context
        };

        store.dispatch(action);
    }

    return result;
}
