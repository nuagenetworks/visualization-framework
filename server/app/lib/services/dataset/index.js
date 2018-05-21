import { getUsedParameters } from '../../utils/configurations';
import { DirectoryTypes, FetchManager } from '../../utils/fetch';
import { TaffyFilter } from '../../utils/taffyFilters';

import { taffy } from 'taffydb';


const fetch = (parameters, context) => {    
    return new Promise((resolve, reject) => {
        
        let file = context[DirectoryTypes.DATASET] && context['dataset'] ? `${context.dataset}/${parameters.id}`:'database';
        let databaseConfig = FetchManager.fetchAndParseJSON(file, DirectoryTypes.DATASET);

        if(!databaseConfig) {
          reject({message: 'Dataset is not defined'});
          return;
        }

        let db = taffy(databaseConfig);

        let params = parameters.query ? TaffyFilter.converter(parameters.query) : [];
        let query = db().filter(...params);

        if (parameters.sortBy)
            query = query.order(parameters.sortBy);

        if (parameters.limit)
            query = query.limit(parameters.limit);

        const results = query.get();

    
        resolve(results);
    });
};

export const DatasetService = {
    id: 'dataset',
    fetch: fetch,
}
