import { ElasticSearchService } from "../../configs/nuage/elasticsearch/index";
import { VSDService } from "../../configs/nuage/vsd/index";
import { MemoryService } from "../memory";
import { DatasetService } from "../dataset";

import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";

let config = {
    timingCache: 5000,
    api: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/",
}

/*
    Stores all services.
*/
let services = {
    elasticsearch: ElasticSearchService,
    VSD: VSDService,
    memory: MemoryService,
    dataset: DatasetService
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
    const isScript = typeof(queryConfiguration) === "string";

    if (isScript)
        return queryConfiguration + "[" + JSON.stringify(context) + "]";
    // End TODO

    const service = getService(queryConfiguration.service)
    return service.getRequestID(queryConfiguration, context);
}

const fetchData = function(visualizationId, context) {
    let url = `${config.api}visualizations/fetch/${visualizationId}`;

    return fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(context)
      })
      .then(checkStatus)
      .then(parseJSON);
}

export const ServiceManager = {
    config,
    register,
    getService,
    getRequestID,
    fetchData
}
