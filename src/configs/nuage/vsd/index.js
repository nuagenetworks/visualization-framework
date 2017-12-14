import { parameterizedConfiguration } from "../../../utils/configurations";


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
    return new Promise((resolve, reject) => {
        $.get({
            url: url,
            headers: headers
        })
        .done((response) => {
            return resolve(response)
        })
        .fail((error) => {
            return reject(error)
        });
    });
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
    getURL: getURL,
    makePOSTRequest: makePOSTRequest,
    makePUTRequest: makePUTRequest,
}

const fetch = (configuration, state) => {
    let token          = state.VSD.get(ActionKeyStore.TOKEN),
          api          = state.VSD.get(ActionKeyStore.API) || process.env.REACT_APP_VSD_API_ENDPOINT,
          organization = state.VSD.get(ActionKeyStore.ORGANIZATION);

    if (!api || !token)
        return Promise.reject("No VSD API endpoint specified. To configure the VSD API endpoint, provide the endpoint URL via the environment variable REACT_APP_VSD_API_ENDPOINT at compile time. For a development environment, you can set an invalid value, which will cause the system to provide mock data for testing. For example, you can add the following line to your .bashrc or .profile startup script: 'export REACT_APP_VSD_API_ENDPOINT=http://something.invalid'");

    const url     = VSDServiceTest.getURL(configuration, api),
          headers = getHeaders(token, organization, configuration.query.filter);

    return VSDServiceTest.makeRequest(url, headers);
}

const post = (configuration, body, state) => {
    let token          = state.VSD.get(ActionKeyStore.TOKEN),
          api          = state.VSD.get(ActionKeyStore.API) || process.env.REACT_APP_VSD_API_ENDPOINT,
          organization = state.VSD.get(ActionKeyStore.ORGANIZATION);

    if (!api || !token)
        return Promise.reject("No VSD API endpoint specified. To configure the VSD API endpoint, provide the endpoint URL via the environment variable REACT_APP_VSD_API_ENDPOINT at compile time. For a development environment, you can set an invalid value, which will cause the system to provide mock data for testing. For example, you can add the following line to your .bashrc or .profile startup script: 'export REACT_APP_VSD_API_ENDPOINT=http://something.invalid'");

    const url     = VSDServiceTest.getURL(configuration, api),
          headers = getHeaders(token, organization, configuration.query.filter);

    return VSDServiceTest.makePOSTRequest(url, headers, body);
}

const update = (configuration, body, state) => {
    let token          = state.VSD.get(ActionKeyStore.TOKEN),
          api          = state.VSD.get(ActionKeyStore.API) || process.env.REACT_APP_VSD_API_ENDPOINT,
          organization = state.VSD.get(ActionKeyStore.ORGANIZATION);

    if (!api || !token)
        return Promise.reject("No VSD API endpoint specified. To configure the VSD API endpoint, provide the endpoint URL via the environment variable REACT_APP_VSD_API_ENDPOINT at compile time. For a development environment, you can set an invalid value, which will cause the system to provide mock data for testing. For example, you can add the following line to your .bashrc or .profile startup script: 'export REACT_APP_VSD_API_ENDPOINT=http://something.invalid'");

    const url     = VSDServiceTest.getURL(configuration, api),
          headers = getHeaders(token, organization, configuration.query.filter);

    return VSDServiceTest.makePUTRequest(url, headers, body);
}

export const VSDService = {
    id: "VSD",
    config: config,
    getRequestID: getRequestID,
    getMockResponse: getMockResponse,
    fetch: fetch,
    post: post,
    update: update,
}
