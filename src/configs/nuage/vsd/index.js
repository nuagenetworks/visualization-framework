import $ from "jquery";
import _ from 'lodash';
import objectPath from "object-path";

import { ActionKeyStore } from "./redux/actions";
import { parameterizedConfiguration } from "../../../utils/configurations";
import configData from '../../../config';

import { VSDSearchConvertor } from '../../../lib/vis-graphs/utils/helpers'

const config = {
    api_version: "5.0",
    end_point_prefix: "/nuage/api/"
}

const ERROR_MESSAGE = `No VSD API endpoint specified. To configure the VSD API endpoint,
           provide the endpoint URL via the environment variable REACT_APP_VSD_API_ENDPOINT at compile time.
           For a development environment, you can set an invalid value,
           which will cause the system to provide mock data for testing.
           For example, you can add the following line to your .bashrc or .profile startup script:
           'export REACT_APP_VSD_API_ENDPOINT=http://something.invalid'`

const getHeaders = (params = {}) => {

    // Default headers
    let headers = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "X-Nuage-Organization":"csp"
    }

    if (params.token)
        headers["Authorization"] = "XREST " + params.token

    if (params.organization)
        headers["X-Nuage-Organization"] = params.organization

    if (params.filter)
        headers["X-Nuage-Filter"] = params.filter

    if (params.orderBy)
        headers["X-Nuage-OrderBy"] = params.orderBy

    if (params.page || params.page === 0)
        headers["X-Nuage-Page"] = params.page

    if (params.pageSize)
        headers["x-nuage-PageSize"] = params.pageSize

    if (params.proxyUser)
        headers["X-Nuage-ProxyUser"] = params.proxyUser

    if (params.patchType) {
        headers["X-Nuage-PatchType"] = params.patchType;
    }

    return headers
}

export const getURLEndpoint = (configuration) => {

    let url = configuration.query.parentResource;

    if (configuration.query.hasOwnProperty("parentID"))
        url += "/" + configuration.query.parentID;

    if (configuration.query.hasOwnProperty("resource"))
        url += "/" + configuration.query.resource;

    return url;
}

export const getRequestID = (configuration, context) => {
    const tmpConfiguration = parameterizedConfiguration(configuration, context);
    if (!tmpConfiguration)
        return;

    let URL = getURLEndpoint(tmpConfiguration);

    URL = configuration.id ? `${configuration.vizID}-${configuration.id}-${URL}` : URL;
    if (!tmpConfiguration.query.filter)
        return URL;

    return URL + "-" + tmpConfiguration.query.filter;
}

const getURL = (configuration, api) => {
    const lastIndex = api.length - 1;

    let base_url = api[lastIndex] === "/" ? api.substring(0, lastIndex) : api;
    base_url += config.end_point_prefix + "v" + config.api_version.replace(".", "_") + "/";

    return base_url + getURLEndpoint(configuration);
}

const makeRequest = (url, headers) => {
    // Encapsulates $.get in a Promise to ensure all services are having the same behavior
    return new Promise((resolve, reject) => {
        $.get({
            url: url,
            headers: headers
        })
        .done((response, status, content) => {
            let page = content.getResponseHeader('x-nuage-page') || headers["X-Nuage-Page"]
            let count = parseInt(content.getResponseHeader('x-nuage-count'), 10) || 0;
            
            return resolve({response, header: { page, count, hits: (response && response.length) || 0 }})
        })
        .fail((error) => {
            return reject(error)
        });
    });
}

/**
 *  check and update query for next request if sum of totolCaptured (already fetched data count)
 *  and current data count (header.hits) is less than total count
 *  and increased page by 1 for next request.
 */
const getNextRequest = (header, query, totalCaptured) => {
    let nextQuery   = {},
      nextPage = 0;

    if((totalCaptured + header.hits) < header.count) {
        nextPage = parseInt(header.page, 10) + 1
        nextQuery = {...query};

        nextQuery.query.nextPage = nextPage;
    }

    nextQuery = {...nextQuery, "length":  header.count}

    return nextQuery
}

const makePOSTRequest = (url, headers, body) => {
    return new Promise((resolve, reject) => {
        $.post({
                url: url,
                headers: headers,
                data: JSON.stringify(body),
                dataType: 'json',
                contentType: 'application/json',
            })
            .done((response) => {
                return resolve(response)
            })
            .fail((error) => {
                return reject(error)
            })
            .always((data, status, error) => {
                console.log("POST DONE: data = ", data, " status = ", status, " error = ", error);
            });
    });
}

const makePUTRequest = (url, headers, body) => {
    return new Promise((resolve, reject) => {
        $.ajax({
                method: 'PUT',
                url: url,
                headers: headers,
                data: JSON.stringify(body),
                dataType: 'json',
                contentType: 'application/json',
            })
            .done((response) => {
                return resolve(response)
            })
            .fail((error) => {
                return reject(error)
            })
            .always((data, status, error) => {
                console.log("PUT DONE: data = ", data, " status = ", status, " error = ", error);
            });
    });
}

const makePATCHRequest = (url, headers, body) => {
    return new Promise((resolve, reject) => {
        $.ajax({
            method: 'PATCH',
            url: url,
            headers: headers,
            data: JSON.stringify(body),
            dataType: 'json',
            contentType: 'application/json',
        })
            .done((response) => {
                return resolve(response)
            })
            .fail((error) => {
                return reject(error)
            })
            .always((data, status, error) => {
                console.log("PATCH DONE: payload = ", data, " status = ", status, " error = ", error);
            });
    }).catch((error) => {
        return Promise.reject(error);
    });
}

const getMockResponse = (configuration) => {

    let parent   = configuration.query.parentResource,
        parentID = configuration.query.parentID,
        resource = configuration.query.resource;

    if (!resource && !parentID) {
        switch (parent) {
            case "enterprises":
                return [
                    {
                        "ID": "54334da-6507-484e-8d5b-11d44c4a852e",
                        "lastUpdatedBy":"3321e4da-6507-484e-8d5b-11d44c4a852e",
                        "name":"Nuage Networks",
                    }
                ];
            default:
                throw new Error("You should set a default value for = " + parent);
            }
    }

    if (!resource) {
        // case of type enterprises/id
        switch (parent) {
            case "enterprises":
                return [
                    {
                        ID: parentID,
                        name: "Enterprise Test"
                    }
                ]

            case "applications":
                return [
                    {
                        ID: parentID,
                        name: "Enterprise Test",
                        oneWayLoss: 10,
                        oneWayJitter: 20,
                        oneWayDelay: 15
                    }
                ]
            default:
                throw new Error("You should set a default value for = " + parent);
        }
    }

    switch (resource) {
        case "nsgateways":
            // case of enterprises/id/domains
            return [
                {
                    ID: "98545-1232-3432",
                    name: "NSG 1",
                    personality: "NSG"
                },
                {
                    ID: "906767-432432-89343",
                    name: "NSG 2",
                    personality: "NSG"
                }
            ]
        default:
            // case of enterprises/id/domains
            return [
                {
                    ID: "12345-1232-3432",
                    name: "Domain 1",
                },
                {
                    ID: "432980-432432-89343",
                    name: "Domain 2",
                },
                {
                    ID: "54365-4387-948305",
                    name: "Domain 3",
                }
            ]
    }
}

export const VSDServiceTest = {
    makeRequest,
    getURL,
    makePOSTRequest,
    makePUTRequest,
    makePATCHRequest
}

const fetch = (configuration, state, totalCaptured = 0) => {
    let token          = state.VSD.get(ActionKeyStore.TOKEN),
          api          = state.VSD.get(ActionKeyStore.API) || configData.VSD_API_ENDPOINT,
          organization = state.VSD.get(ActionKeyStore.ORGANIZATION);

    if (!api || !token)
        return Promise.reject(ERROR_MESSAGE);

    const url     = VSDServiceTest.getURL(configuration, api),
          headers = getHeaders({
              token,
              organization,
              filter: configuration.query.filter || null,
              pageSize: configuration.query.pageSize,
              page: (configuration.query && configuration.query.nextPage) || 0,
              orderBy: configuration.query.sort || null,
             });

    return new Promise((resolve, reject) => {

        VSDServiceTest.makeRequest(url, headers)
        .then( (results) => {
            if (results.response) {
                return resolve({
                    response: results.response,
                    nextQuery: getNextRequest(results.header, configuration, totalCaptured)
                })
            }
            return resolve(results)
        }, (error) => {
            return reject(error)
        })
    })
}

const post = (configuration, body, state) => {
    let token          = state.VSD.get(ActionKeyStore.TOKEN),
          api          = state.VSD.get(ActionKeyStore.API) || configData.VSD_API_ENDPOINT,
          organization = state.VSD.get(ActionKeyStore.ORGANIZATION);

    if (!api || !token)
        return Promise.reject(ERROR_MESSAGE);

    const url     = VSDServiceTest.getURL(configuration, api),
          headers = getHeaders({token, organization, filter: configuration.query.filter});

    return VSDServiceTest.makePOSTRequest(url, headers, body);
}

const update = (configuration, body, state) => {
    let token          = state.VSD.get(ActionKeyStore.TOKEN),
          api          = state.VSD.get(ActionKeyStore.API) || configData.VSD_API_ENDPOINT,
          organization = state.VSD.get(ActionKeyStore.ORGANIZATION);

    if (!api || !token)
        return Promise.reject(ERROR_MESSAGE);

    const url     = VSDServiceTest.getURL(configuration, api),
          headers = getHeaders({token, organization, filter: configuration.query.filter});

    return VSDServiceTest.makePUTRequest(url, headers, body);
}

const patch = (configuration, body, state, patchHeader = 'ADD') => {
    let token          = state.VSD.get(ActionKeyStore.TOKEN),
        api          = state.VSD.get(ActionKeyStore.API) || configData.VSD_API_ENDPOINT,
        organization = state.VSD.get(ActionKeyStore.ORGANIZATION);

    if (!api || !token)
        return Promise.reject(ERROR_MESSAGE);

    const url     = VSDServiceTest.getURL(configuration, api),
        headers = getHeaders({token, organization, filter: configuration.query.filter, page: undefined, orderBy: undefined, proxyUser: undefined, patchHeader});

    return VSDServiceTest.makePATCHRequest(url, headers, body);
}

const remove = (configuration, body, state) => {
    return patch(configuration, body, state, 'REMOVE');
}

const add = (configuration, body, state) => {
    return patch(configuration, body, state);
}

const getPageSizePath = function() {
    return 'query.pageSize';
}

const updatePageSize = function(queryConfiguration, pageSize) {
    objectPath.set(queryConfiguration, this.getSizePath(), pageSize);
    return queryConfiguration;
}

const getNextPageQuery = function (queryConfiguration, nextPage) {
    queryConfiguration.query.nextPage = nextPage;
    return queryConfiguration;
}

// Add custom sorting into VSD query
const addSorting = function (queryConfiguration, sort) {
    queryConfiguration.query.sort = `${sort.column} ${sort.order}`
    return queryConfiguration;
}

// Add custom searching from searchbox into VSD query
const addSearching = function (queryConfiguration, search) {
    if (search.length) {
        let filter = objectPath.get(queryConfiguration, 'query.filter');

        objectPath.push(queryConfiguration, 'query.filter', (filter ? `(${filter}) AND ` : '') + VSDSearchConvertor(search));
    }

    return queryConfiguration;
}

export const VSDService = {
    id: "VSD",
    config,
    getRequestID,
    getMockResponse,
    fetch,
    post,
    update,
    add,
    remove,
    getPageSizePath,
    updatePageSize,
    getNextPageQuery,
    addSorting,
    addSearching
};
