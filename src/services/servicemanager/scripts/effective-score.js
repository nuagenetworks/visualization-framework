import { ServiceManager } from "../../servicemanager/index";

export const main = function (context) {
    // Exemple on how to get a service
    const service = ServiceManager.getService("VSD");

    // Return a dummy response for now
    return Promise.resolve([
        {
            "ID": "1",
            "name": "Chris",
        },
        {
            "ID": "2",
            "name": "Curran",
        },
        {
            "ID": "3",
            "name": "Ronak",
        },
        {
            "ID": "4",
            "name": "Somebody else!",
        },
    ]);
}
