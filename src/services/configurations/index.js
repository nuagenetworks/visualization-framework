import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";

let config = {
    path: "/src/configs/nuage/",
}

export const fetchConfiguration = function (id) {
    let configType = "dashboards";
    let url = config.path + configType + "/" + id + ".json";
    return fetch(url)
        .then(checkStatus)
        .then(parseJSON);
}
