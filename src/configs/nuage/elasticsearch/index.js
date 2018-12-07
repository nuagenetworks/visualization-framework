import elasticsearch from "elasticsearch";
import objectPath from 'object-path';

import estabify from "./tabify";
import { ActionKeyStore } from "./redux/actions";
import { parameterizedConfiguration, getUsedParameters } from "../../../utils/configurations";
import configData from '../../../config'

import { ESSearchConvertor } from '../../../lib/vis-graphs/utils/helpers'

import * as tabification from './tabification';

const ERROR_MESSAGE = "unable to fetch data."

var client = null;
let config = function () {
    return {
        host: null,
        log: 'trace',
        apiVersion: '2.2'   
    }
}

export const getCurrentConfig = function (state) {
    let currentConfig = config()
    currentConfig.host = (state.ES.get(ActionKeyStore.ES_HOST) || configData.ELASTICSEARCH_HOST)
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
        let esRequest,
            results = {
                response: [],
                nextQuery: null
            };

        //if data comes from scroll (if `scroll: true` in query config)
        if(queryConfiguration.query && queryConfiguration.query.nextPage) {
            esRequest  = client.scroll({
                scroll: configData.ES_SCROLL_TIME,
                scroll_id: queryConfiguration.query.nextPage,
            })
        } else {
            const newQuery = queryConfiguration.scroll ? Object.assign({}, queryConfiguration.query, {scroll: configData.ES_SCROLL_TIME}) : queryConfiguration.query
            esRequest  = client.search(newQuery)
        }
        esRequest.then(function (response) {
            results.response = response

            // if scrolling is enabled then update next query for fetching data via scrolling
            if (response.hits.hits.length && response._scroll_id) {
                results.nextQuery = {
                    query: {
                        scroll: configData.ES_SCROLL_TIME,
                        nextPage: response._scroll_id,
                    },
                    length: response.hits.total
                }
            }

            return resolve(results);

        }, function (error) {
            if (!error.body)
                reject("Unable to connect to ElasticSearch datastore. Please check to ensure ElasticSearch datastore can be reached");
            else {
                console.error(error.body.error.reason + ": " + error.body.error["resource.id"])
                reject(ERROR_MESSAGE);
            }
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
                reject("Unable to connect to ElasticSearch datastore. Please check to ensure ElasticSearch datastore can be reached");
            else {
                console.error(error.body.error.reason + ": " + error.body.error["resource.id"])
                reject(ERROR_MESSAGE);
            }
                
        });
    });
}

/* Computes the request ID based on the queryConfiguration that are actually used
 */
const getRequestID = function (queryConfiguration, context) {
    const tmpConfiguration = parameterizedConfiguration(queryConfiguration, context);

    if (!tmpConfiguration)
        return;

    const parameters = getUsedParameters(queryConfiguration, context);

    if (Object.keys(parameters).length === 0)
        return queryConfiguration.id;

    return `${queryConfiguration.vizID}-${queryConfiguration.id}[${JSON.stringify(parameters)}]`;
}

// Add custom sorting into ES query
const addSorting = function (queryConfiguration, sort) {
    queryConfiguration.query.body.sort = {
        [sort.column]: {
            order: sort.order
        }
    };

    return queryConfiguration;
}

// Add custom searching from searchbox into ES query
const addSearching = function (queryConfiguration, search) {
    if (search.length) {
        objectPath.push(queryConfiguration, 'query.body.query.bool.must', ESSearchConvertor(search));
    }

    return queryConfiguration;
}

const getPageSizePath = function() {
    return 'query.body.size';
}

const updatePageSize = function(queryConfiguration, pageSize) {
    objectPath.set(queryConfiguration, this.getPageSizePath(), pageSize);
    return queryConfiguration;
}

const getNextPageQuery = function (queryConfiguration, nextPage) {
    return Object.assign(queryConfiguration, { query: {
        scroll: configData.ES_SCROLL_TIME,
        nextPage: nextPage
    }})
}

const tabify = (response, queryConfiguration) => {
    if (queryConfiguration) {
        const customTabify = objectPath.get(queryConfiguration, 'tabify');
        if (customTabify) {
            const tabificationFunction = tabification[customTabify];
            return tabificationFunction(response, queryConfiguration)
        }
    }
    return estabify(response, queryConfiguration);
}

export const ElasticSearchService = {
    id: "elasticsearch",
    fetch: fetch,
    ping: ping,
    getRequestID: getRequestID,
    addSorting: addSorting,
    addSearching: addSearching,
    tabify: tabify,
    ESClient,
    getPageSizePath,
    updatePageSize,
    getNextPageQuery
}
