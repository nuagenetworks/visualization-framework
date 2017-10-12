import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";


const config = {
    path: process.env.PUBLIC_URL + "/configurations/",
    api: process.env.REACT_APP_API_URL ? process.env.REACT_APP_API_URL : "http://localhost:8010/middleware/api/",
    cachingTime: 120000, // (ms) -> default 30s
}

const fetchConfiguration = function (id, configType) {
    let url = config.api + configType + "/" + id;

    return fetch(url)
        .then(checkStatus)
        .then(parseJSON);
}

const processRequest = function (configType, method ='GET', params) {
    let url = config.api + configType;
    params = (typeof params !== 'undefined') ?  JSON.stringify(params) : {};
    return fetch(url, {
        method: method,
        headers: new Headers({
          'Content-Type': 'application/json'
        }),
        body: params
    })
    .then(checkStatus)
    .then(parseJSON);
}

export const ConfigurationService = {
    id: "configuration",
    fetch: fetchConfiguration,
    config: config,
    processRequest: processRequest
}
