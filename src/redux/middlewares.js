export const updateContextMiddleware = store => next => action => {

    const result = next(action),
          state  = store.getState();

    if (action.type === "@@reduxReactRouter/routerDidChange" && state.router)
    {
        // Generate a specific action to update the context
        const action = {
            type: "ACTION_UPDATE_CONTEXT",
            context: state.router.location.query
        };
        store.dispatch(action);
    }

    return result;
}

// TODO: We need to find a way to plug middlewares like this one.
// as it is very specific to Nuage features (VSS or AAR)
export const updateVisualizationTypeMiddleware = store => next => action => {
    const result = next(action),
          state  = store.getState();

    if (action.type === "@@reduxReactRouter/routerDidChange" && state.router && state.router.location.pathname.indexOf('dashboards') !== -1)
    {
        const id           = state.router.params.id,
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

export const updateConfigurationMiddleware = store => next => action => {
    const result = next(action),
          state  = store.getState();

    if (action.type === "@@reduxReactRouter/routerDidChange" && state.router
        && (state.router.location.pathname.indexOf('dashboards') !== -1 
        || state.router.location.pathname.indexOf('visualizations') !== -1))
    {
        const id           = state.router.params.id,
              previousPage = state.interface.get("updatePage");


        if(!previousPage || previousPage !== id ) {

            store.dispatch({
                    type: "ACTION_UPDATE_PAGE",
                    id: id
            });

            store.dispatch({
                    type: "RESET_CONFIGURATION",
            });
        }      
    }

    return result;
}
