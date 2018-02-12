import { DirectoryTypes, FetchManager } from '../../utils/fetch';

export const main = function (context) {
    // Example on how to get a service
    // const service = ServiceManager.getService("elasticsearch");

    // Example of request
    const firstQueryID = "effective-score-part1";

    return FetchManager.fetchAndParseJSON(firstQueryID, DirectoryTypes.QUERY);
}
