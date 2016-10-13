import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";

const config = {
    path: "/src/configs/nuage/configurations/",
    cachingTime: 30000, // (ms) -> default 30s
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
