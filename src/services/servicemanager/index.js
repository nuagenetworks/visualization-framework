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
    const service = getService(queryConfiguration.service)
    return service.getRequestID(queryConfiguration, context);
}


export const ServiceManager = {
    config: config,
    register: register,
    getService: getService,
    getRequestID: getRequestID,
}
