import { getUsedParameters } from '../../utils/configurations';
import { DirectoryTypes, FetchManager } from '../../utils/fetch';

import { taffy } from 'taffydb';


const fetch = (parameters, context) => {

    let file = context[DirectoryTypes.DATASET] ? context[DirectoryTypes.DATASET] : "database";
    let databaseConfig = FetchManager.fetchAndParseJSON(file, DirectoryTypes.DATASET);
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

export const DatasetService = {
    id: 'dataset',
    fetch: fetch
}