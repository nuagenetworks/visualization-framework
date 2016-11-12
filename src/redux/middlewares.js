export const updateContextMiddleware = store => next => action => {

    const result = next(action),
          state  = store.getState();

    if (action.type === "@@reduxReactRouter/routerDidChange" && state.router)
    {
        // Generate a specific action to update the context
        const action = {
            type:"ACTION_UPDATE_CONTEXT",
            context:state.router.location.query
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

    if (action.type === "@@reduxReactRouter/routerDidChange" && state.router)
    {
        const id = state.router.params.id;

        if (id && id.length > 3) {
            const action = {
                type:"ACTION_UPDATE_VISUALIZATION_TYPE",
                visualizationType:id.substr(0, 3).toUpperCase()
            };
            store.dispatch(action);
        }
    }

    return result;
}
