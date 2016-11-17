import elasticsearch from "elasticsearch";
import tabify from "./tabify";
import { getUsedParameters } from "../../../utils/configurations";

let config = function () {
    return {
        host: 'http://localhost:9200',
        log: 'trace',
        apiVersion: '2.2'
    }
}

export const getCurrentConfig = function () {
    let currentConfig = config()

    if (process.env.REACT_APP_ELASTICSEARACH_HOST)
        currentConfig.host = process.env.REACT_APP_ELASTICSEARACH_HOST;

    return currentConfig;
}

let ESClient = function () {
    return new elasticsearch.Client(getCurrentConfig());
}

const fetch = function (parameters, state) {
    var client = ESClient() // eslint-disable-line
    return client.search(parameters.query);
}

const ping = function (parameters, state) {
    var client = ESClient(); // eslint-disable-line
    return client.ping(parameters);
}

/* Computes the request ID based on the parameters that are actually used
 */
const getRequestID = function (query, context) {
    const parameters = getUsedParameters(query, context);

    if (Object.keys(parameters).length === 0)
        return query.id;

    return query.id + "[" + JSON.stringify(parameters) + "]";
}

export const ElasticSearchService = {
    id: "elasticsearch",
    fetch: fetch,
    ping: ping,
    getRequestID: getRequestID,
    tabify: tabify
}
