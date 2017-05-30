import { getUsedParameters } from '../../utils/configurations';
import { DirectoryTypes, FetchManager } from '../../utils/fetch';

import { taffy } from 'taffydb';

const fetch = (parameters) => {
    let databaseConfig = FetchManager.fetchAndParseJSON('database', DirectoryTypes.MEMORY)

    if(!databaseConfig)
        return Promise.reject();

    let db = taffy(databaseConfig);


    let query = db().filter(parameters.query);

    if (parameters.sortBy)
        query = query.order(parameters.sortBy);

    if (parameters.limit)
        query = query.limit(parameters.limit);

    const results = query.get();

    return new Promise((resolve, reject) => {
        resolve(results);
    });
}

export const MemoryService = {
    id: 'memory',
    fetch: fetch
}
