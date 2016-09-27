import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";

export const config = {
    path: "/src/configs/nuage/",
    cachingTime: 30000, // (ms) -> default 30s
}

export const fetchConfiguration = function (id, configType) {
    let url = config.path + configType + "/" + id + ".json";
    return fetch(url)
        .then(checkStatus)
        .then(parseJSON);
}
