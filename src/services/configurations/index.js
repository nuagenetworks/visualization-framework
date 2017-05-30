import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";


const config = {
    path: process.env.PUBLIC_URL + "/configurations/",
    api: process.env.REACT_APP_API_URL,
    cachingTime: 30000, // (ms) -> default 30s
}

const fetchConfiguration = function (id, configType) {
    let url = config.api + configType + "/" + id;

    return fetch(url)
        .then(checkStatus)
        .then(parseJSON);
}

export const ConfigurationService = {
    id: "configuration",
    fetch: fetchConfiguration,
    config: config,
}
