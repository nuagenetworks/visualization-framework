import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";
import configData from '../../config'


const config = {
    path: process.env.PUBLIC_URL + "/configurations/",
    cachingTime: configData.CACHING_CONFIG_TIME, // (ms) -> default 30s
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
