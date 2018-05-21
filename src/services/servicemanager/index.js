import { ElasticSearchService } from "../../configs/nuage/elasticsearch/index";
import { VSDService } from "../../configs/nuage/vsd/index";
import { MemoryService } from "../memory";
import { DatasetService } from "../dataset";

import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";

var os = require("os");
let config = {
    timingCache: 30000,
    api: process.env.REACT_APP_API_URL || "https://" + os.hostname() + ":8010/middleware/api/",
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

const fetchData = function(visualizationId = null, query = {}, context) {

    let url,
        body = {
        context
    }

    if(!query.id && query.service === 'VSD') {
        url = `${config.api}visualizations/fetch/vsd`;
        body['query'] = query
    } else {
        url = `${config.api}visualizations/fetch/${visualizationId}/${query.id}`
    }

    return fetch(url, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json'
        },
        body: JSON.stringify(body)
    })
        .then(checkStatus)
        .then(parseJSON);
    }

export const ServiceManager = {
    config,
    register,
    getService,
    getRequestID,
    executeScript,
    tabify,
    fetchData
}
