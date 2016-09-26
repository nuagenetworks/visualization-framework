import elasticsearch from 'elasticsearch'

let config = function () {
    return {
        host: 'localhost:9200',
        log: 'trace',
        apiVersion: '2.2'
    }
}

let ESClient = function () {
    let currentConfig = config()

    if (process.env.REACT_APP_ELASTICSEARACH_HOST)
        currentConfig.host = process.env.REACT_APP_ELASTICSEARACH_HOST;

    return new elasticsearch.Client(currentConfig);
}

export const search = function (parameters) {
    var client = ESClient() // eslint-disable-line
    return client.search(parameters);
}

export const ping = function (parameters) {
    var client = ESClient(); // eslint-disable-line
    return client.ping(parameters);
}
