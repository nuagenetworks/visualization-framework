import elasticsearch from "elasticsearch";
import tabify from "./tabify";
import { ActionKeyStore } from "./redux/actions";
import { getUsedParameters } from "../../../utils/configurations";

var client = null;
let config = function () {
    return {
        host: null,
        log: 'trace',
        apiVersion: '2.2',
        sniffOnStart: true,
        sniffInterval: 60000,
        sniffOnConnectionFault: true
    }
}

export const getCurrentConfig = function (state) {
    let currentConfig = config()

    currentConfig.host = state.ES.get(ActionKeyStore.ES_HOST) || process.env.REACT_APP_ELASTICSEARCH_HOST;

    return currentConfig;
}

let ESClient = function (state) {
    var config = getCurrentConfig(state);

    if (!config.host){
        throw new Error("The ElasticSearch host is not configured. You can configure the ElasticSearch host by setting the environment variable REACT_APP_ELASTICSEARCH_HOST at compile time. For development with a local ElasticSearch instance running on the default port, you can put the following in your .bashrc or .profile startup script: 'export REACT_APP_ELASTICSEARCH_HOST=http://localhost:9200'");
    }

    return new elasticsearch.Client(config);
}

const fetch = function (queryConfiguration, state) {

    if (client == null) {
        client = ESClient(state) ;
    }

    if (!client)
        return Promise.reject();

    return new Promise((resolve, reject) => {
        client.search(queryConfiguration.query).then(function (body) {
            resolve(body);
        }, function (error) {
            if (!error.body)
                reject("no active Elastic Search host");
            else
                reject(error.body.error.reason + ": " + error.body.error["resource.id"]);
        });
    });
}

const ping = function (queryConfiguration, state) {
    var client = ESClient(); // eslint-disable-line

    if (!client)
        return Promise.reject();

    return new Promise((resolve, reject) => {
        client.search(queryConfiguration.query).then(function (body) {
            resolve(body);
        }, function (error) {
            if (!error.body)
                reject("no active Elastic Search host");
            else
                reject(error.body.error.reason + ": " + error.body.error["resource.id"]);
        });
    });
}

/* Computes the request ID based on the queryConfiguration that are actually used
 */
const getRequestID = function (queryConfiguration, context) {
    const parameters = getUsedParameters(queryConfiguration, context);
    if (Object.keys(parameters).length === 0)
        return queryConfiguration.id;

    return queryConfiguration.id + "[" + JSON.stringify(parameters) + "]";
}

export const ElasticSearchService = {
    id: "elasticsearch",
    fetch: fetch,
    ping: ping,
    getRequestID: getRequestID,
    tabify: tabify
}
