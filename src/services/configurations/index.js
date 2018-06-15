import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";


const config = {
    path: process.env.PUBLIC_URL + "/configurations/",
    cachingTime: process.env.REACT_APP_CACHING_CONFIG_TIME ? process.env.REACT_APP_CACHING_CONFIG_TIME : 900000 // (ms) -> default 15m
}

const fetchConfiguration = function (id, configType) {
    let url = config.path + configType + "/" + id + ".json";

    return fetch(url)
        .then(checkStatus)
        .then(parseJSON);
}

export const ConfigurationService = {
    id: "configuration",
    fetch: fetchConfiguration,
    config: config,
}
