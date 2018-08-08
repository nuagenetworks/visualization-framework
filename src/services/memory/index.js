import $ from 'jquery';
import { getUsedParameters } from '../../utils/configurations';
import { taffy } from 'taffydb';

const config = {
    path: '/database.json',
}

let database = null;

const loadDataBaseFile = () => {
    if (database)
        return Promise.resolve(database);

    let url = process.env.PUBLIC_URL + config.path;

    return $.get({
        url: url
    }).then((response) => {
        database = taffy(response);
        return database
    });
}

export const getRequestID = (configuration, context) => {
    const parameters = getUsedParameters(configuration, context);

    if (Object.keys(parameters).length === 0)
        return configuration.id;

    return configuration.id + '[' + JSON.stringify(parameters) + ']';
}

const fetch = (parameters, state) => {
    return loadDataBaseFile().then((db) => {
        let query = db().filter(parameters.query);

        if (parameters.sortBy)
            query = query.order(parameters.sortBy);

        if (parameters.limit)
            query = query.limit(parameters.limit);

        const response = query.get();

        // console.error(JSON.stringify(results.slice(0, 3), null, 2));
        return Promise.resolve({response});
    });
}

export const MemoryService = {
    id: 'memory',
    config: config,
    getRequestID: getRequestID,
    fetch: fetch
}
