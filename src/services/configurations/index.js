import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";

let config = {
    path: "/src/configs/nuage/configurations/",
}

export const fetchConfiguration = function (id, configType) {
    let url = config.path + configType + "/" + id + ".json";
    return fetch(url)
        .then(checkStatus)
        .then(parseJSON);
}
