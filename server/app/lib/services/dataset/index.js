import { getUsedParameters } from '../../utils/configurations';
import { DirectoryTypes, FetchManager } from '../../utils/fetch';
import { TaffyFilter } from '../../utils/taffyFilters';

import { taffy } from 'taffydb';


const fetch = (parameters, context) => {
    let file = context[DirectoryTypes.DATASET] && context['dashboard'] ? `${context['dashboard']}/${context[DirectoryTypes.DATASET]}` : "database";
    let databaseConfig = FetchManager.fetchAndParseJSON(file, DirectoryTypes.DATASET);
    if(!databaseConfig)
        return Promise.reject();

    let db = taffy(databaseConfig);

    let params = parameters.query ? TaffyFilter.converter(parameters.query) : {};

    let query = db().filter(params);

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
