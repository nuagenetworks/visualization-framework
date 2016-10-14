import elasticsearch from 'elasticsearch'

let config = function () {
    return {
        host: 'http://localhost:9200',
        log: 'trace',
        apiVersion: '2.2'
    }
}

export const getCurrentConfig = function () {
    let currentConfig = config()

    if (process.env.REACT_APP_ELASTICSEARACH_HOST)
        currentConfig.host = process.env.REACT_APP_ELASTICSEARACH_HOST;

    return currentConfig;
}

let ESClient = function () {
    return new elasticsearch.Client(getCurrentConfig());
}

const fetch = function (parameters, state) {
    var client = ESClient() // eslint-disable-line
    return client.search(parameters.query);
}

const ping = function (parameters, state) {
    var client = ESClient(); // eslint-disable-line
    return client.ping(parameters);
}

const getRequestID = function (query, context) {
    return query.id + "[" + JSON.stringify(context) + "]";
}

export const ElasticSearchService = {
    id: "elasticsearch",
    fetch: fetch,
    ping: ping,
    getRequestID: getRequestID,
}
