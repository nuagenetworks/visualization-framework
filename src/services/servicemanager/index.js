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


export const ServiceManager = {
    config: config,
    register: register,
    getService: getService,
}
