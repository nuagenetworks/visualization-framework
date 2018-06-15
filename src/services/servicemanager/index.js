import { ElasticSearchService } from "../../configs/nuage/elasticsearch/index";
import { VSDService } from "../../configs/nuage/vsd/index";
import { MemoryService } from "../memory";

let config = {
    timingCache: process.env.REACT_APP_CACHING_QUERY_TIME ? process.env.REACT_APP_CACHING_QUERY_TIME : 30000,
}

/*
    Stores all services.
*/
let services = {
    elasticsearch: ElasticSearchService,
    VSD: VSDService,
    memory: MemoryService
};

/*
    Registers a new service to a service name
*/
const register = function (service, serviceName) {
    services[serviceName] = service;
}

/*
    Get the service registered for the given name
*/
const getService = function (serviceName) {
    if (!(serviceName in services))
        throw new Error("No service named " + serviceName + " has been registered yet!" );

    return services[serviceName];
}

/*
    Get the query ID for the given configuration and the given context

    Arguments:
    * queryConfiguration: The query configuration
    * context: the context if the query configuration should be parameterized

    Returns:
    A unique string that represents the request ID
*/
const getRequestID = function (queryConfiguration, context) {

    // TODO: Temporary - Replace this part in the middleware
    // Note: It should actually be its own service !
    if(!queryConfiguration)
        return

    const isScript = typeof(queryConfiguration) === "string";

    if (isScript)
        return queryConfiguration + "[" + JSON.stringify(context) + "]";
    // End TODO

    try {
        const service = getService(queryConfiguration.service)
        return service.getRequestID(queryConfiguration, context)
    } catch (error) {
        return
    }
}

/*
    Tabify the results according to the service that has been used

    Arguments:
    * serviceName: the service name
    * response: the response results

    Returns:
        An array of results
*/
const tabify = function (queryConfiguration, response) {
    const serviceName = queryConfiguration ? queryConfiguration.service : "VSD"; // In case of scripts...

    const service = getService(serviceName)

    if (!service || !service.hasOwnProperty("tabify"))
        return response;

    return service.tabify(response);
}


// TODO: Temporary - Replace this part in the middleware
const executeScript = function (scriptName, context) {
    // TODO: For now, let's put the script in the treeview as discussed on 11/03
    // Later, this part should be done in our middleware
    let main =  require(`./scripts/${scriptName}.js`).main;

    if (main)
        return main(context);

    return false;
}


export const ServiceManager = {
    config: config,
    register: register,
    getService: getService,
    getRequestID: getRequestID,
    executeScript: executeScript,
    tabify: tabify,
}
