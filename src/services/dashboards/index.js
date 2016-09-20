import "whatwg-fetch";
import { checkStatus, parseJSON } from "../common";

let config = {
    path: "/src/configs/nuage/dashboards/",
}

export const fetchConfiguration = function (identifier) {
    let url = config.path + identifier + ".json";
    return fetch(url)
        .then(checkStatus)
        .then(parseJSON);
}
