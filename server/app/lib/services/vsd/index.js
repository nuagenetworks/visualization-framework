import { rp } from "request-promise";

import { ActionKeyStore } from "./redux/actions";
import { parameterizedConfiguration } from "../../utils/configurations";
import Constants from '../../../configurations/constants';


const config = {
    api_version: "4.0",
    end_point_prefix: "/nuage/api/"
}

const getHeaders = (token, organization, filter, page, orderBy, proxyUser) => {

    // Default headers
    let headers = {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "X-Nuage-Organization":"csp",
    }

    if (token)
        headers["Authorization"] = "XREST " + token

    if (organization)
        headers["X-Nuage-Organization"] = organization

    if (filter)
        headers["X-Nuage-Filter"] = filter

    if (orderBy)
        headers["X-Nuage-OrderBy"] = orderBy

    if (page)
        headers["X-Nuage-Page"] = page

    if (proxyUser)
        headers["X-Nuage-ProxyUser"] = proxyUser

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
    var rp = require('request-promise');
    return new Promise((resolve, reject) => {
        rp({
            url: url,
            headers: headers
        })
        .then((response) => {
            return resolve(response ? JSON.parse(response) : [])
        })
        .catch((error) => {
            console.log(error)
            return reject({message: error})
        });
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
                        name: "Enterprise Test",
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
    makeRequest: makeRequest,
    getURL: getURL
}

const fetch = (configuration, context) => {
    let token          = context.TOKEN,
          api          = context.API || Constants.vsdApiEndPoint,
          organization = context.organization;

    if (!api || !token)
        return Promise.reject({message: "No VSD API endpoint specified. To configure the VSD API endpoint, provide the endpoint URL via the environment variable REACT_APP_VSD_API_ENDPOINT at compile time. For a development environment, you can set an invalid value, which will cause the system to provide mock data for testing. For example, you can add the following line to your .bashrc or .profile startup script: 'export REACT_APP_VSD_API_ENDPOINT=http://something.invalid'"});

    const url     = VSDServiceTest.getURL(configuration, api),
          headers = getHeaders(token, organization, configuration.query.filter);

    return VSDServiceTest.makeRequest(url, headers);
}

export const VSDService = {
    id: "VSD",
    config: config,
    getRequestID: getRequestID,
    getMockResponse: getMockResponse,
    fetch: fetch
}
