import $ from "jquery";

import { ActionKeyStore } from "./redux/actions";
import { parameterizedConfiguration } from "../../../utils/configurations";

const config = {
    api_version: "4.0",
    headers: {
        "Accept": "*/*",
        "Content-Type": "application/json",
        "X-Nuage-Organization":"csp",
    }
}

const getHeaders = (token, filter, orderBy, page, proxyUser) => {
    let headers = config.headers;

    if (token)
        headers["Authorization"] = "XREST " + token

    if (filter)
        headers["X-Nuage-Filter"] = filter

    if (orderBy)
        headers["X-Nuage-OrderBy"] = orderBy

    if (page)
        headers["X-Nuage-Page"] = page

    if (proxyUser)
        headers["X-Nuage-ProxyUser"] = proxyUser

    // console.info(headers);
    return headers
}

export const getRequestID = (configuration, context) => {
    const pQuery = parameterizedConfiguration(configuration.query, context);

    if (!pQuery)
        return;

    let url = pQuery.parentResource;

    if (pQuery.hasOwnProperty("parentID"))
        url += "/" + pQuery.parentID;

    if (pQuery.hasOwnProperty("resource"))
        url += "/" + pQuery.resource;

    return url;
}

const getURL = (parameters, api) => {
    let base_url = api + "v" + config.api_version.replace(".", "_") + "/";

    return base_url + getRequestID(parameters);
}

const makeRequest = (url, token) => {
    // Encapsulates $.get in a Promise to ensure all services are having the same behavior
    return new Promise( (resolve, reject) => {
        $.get({
            url: url,
            headers: getHeaders(token)
        })
        .done((response) => {
            return resolve(response)
        })
        .fail((error) => {
            return reject(error)
        });
    });
}

const getMockResponse = (requestID) => {
    let params = requestID.split("/"),
        nbParams = params.length;

    if (nbParams === 1) {
        switch (requestID) {
            case "licenses":
                return [
                    {
                        "ID": "83cee4da-6507-484e-8d5b-11d44c4a852e",
                        "lastUpdatedBy":"3321e4da-6507-484e-8d5b-11d44c4a852e",
                        "provider":"Nuage Networks",
                        "city":"Mountain View",
                    }
                ];

            case "enterprises":
                return [
                    {
                        "ID": "54334da-6507-484e-8d5b-11d44c4a852e",
                        "lastUpdatedBy":"3321e4da-6507-484e-8d5b-11d44c4a852e",
                        "name":"Nuage Networks",
                    }
                ];
            default:
                throw new Error("You should set a default value for requestID = " + requestID);
            }
    }

    else if (nbParams === 2) {
        // case of type enterprises/id
        switch (params[0]) {
            case "enterprises":
                return [
                    {
                        ID: params[1],
                        name: "Enterprise Test",
                    }
                ]
            default:
                throw new Error("You should set a default value for requestID = " + requestID);
        }
    } else {
        switch (params[params.length - 1]) {
            case "nsgateways":
                // case of enterprises/id/domains
                return [
                    {
                        ID: "98545-1232-3432",
                        name: "NSG 1",
                    },
                    {
                        ID: "906767-432432-89343",
                        name: "NSG 2",
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
}

export const VSDServiceTest = {
    makeRequest: makeRequest,
    getURL: getURL,
}

const fetch = (parameters, state) => {
    let token = state.VSD.get(ActionKeyStore.TOKEN),
          api = state.VSD.get(ActionKeyStore.API) || process.env.REACT_APP_VSD_API_ENDPOINT;

    if (!api)
        return Promise.reject("No API endpoint specified");

    const url = VSDServiceTest.getURL(parameters, api);
    return VSDServiceTest.makeRequest(url, token);
}

const tabify = (results) => {
    return results;
}

export const VSDService = {
    id: "VSD",
    config: config,
    getRequestID: getRequestID,
    getMockResponse: getMockResponse,
    fetch: fetch,
    tabify: tabify
}
