import { ServiceManager } from "../../servicemanager/index";

import {
    Actions as ServiceActions,
    ActionKeyStore as ServiceActionKeyStore
} from "../redux/actions";
import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../../services/configurations/redux/actions";

import store from "../../../redux/store"


export const main = function (context) {
    // Example on how to get a service
    // const service = ServiceManager.getService("elasticsearch");

    // Example of request
    const firstQueryID = "effective-score-part1";

    // Get the query configuration and store the information into the redux state
    store.dispatch(ConfigurationsActions.fetchIfNeeded(firstQueryID, ConfigurationsActionKeyStore.QUERIES))
        .then(
            () => {
                const configurationState = store.getState().configurations;
                const queryConfiguration = configurationState.getIn([ConfigurationsActionKeyStore.QUERIES, firstQueryID, ConfigurationsActionKeyStore.DATA]).toJS();

                // Make the query to the correct service and store the information into the redux state
                store.dispatch(ServiceActions.fetchIfNeeded(queryConfiguration, context))
                    .then(
                        () => {
                            // Compute the request ID for this request
                            const requestID = ServiceManager.getRequestID(queryConfiguration, context);

                            // Grab the results from the redux state
                            const results = store.getState().services.getIn([ServiceActionKeyStore.REQUESTS, requestID, ServiceActionKeyStore.RESULTS]);
                            console.error(results);
                        }
                    )

            }
        )

    // Returns a promise with the results.
    // Results will be automatically stored within the redux state.
    return Promise.resolve([
        {
            "ID": "1",
            "name": "Chris",
        },
        {
            "ID": "2",
            "name": "Curran",
        },
        {
            "ID": "3",
            "name": "Ronak",
        },
        {
            "ID": "4",
            "name": "Somebody else!",
        },
    ]);
}
