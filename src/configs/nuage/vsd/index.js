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

export const VSDService = {
    id: "VSD",
    getRequestID: getRequestID
}
