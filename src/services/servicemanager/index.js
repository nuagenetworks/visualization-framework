import { ElasticSearchService } from "../../configs/nuage/elasticsearch/index"
import { VSDService } from "../../configs/nuage/vsd/index"

let config = {
    timingCache: 50000,
}

/*
    Stores all services.
*/
let services = {
    elasticsearch: ElasticSearchService,
    VSD: VSDService,
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
    const isScript = typeof(queryConfiguration) === "string";
    if (isScript)
        return queryConfiguration + "[" + JSON.stringify(context) + "]";

    const service = getService(queryConfiguration.service)
    return service.getRequestID(queryConfiguration, context);
}


// TODO: Temporary - Replace this part in the middleware
const executeScript = function (scriptName, context) {
    // TODO: For now, let's put the script in the treeview as discussed on 11/03
    // Later, this part should be done in our middleware
    let url = "./scripts/" + scriptName + ".js",
        main =  require(url).main;

    if (main)
        return main(context);

    return false;
}


export const ServiceManager = {
    config: config,
    register: register,
    getService: getService,
    getRequestID: getRequestID,
    executeScript: executeScript
}
