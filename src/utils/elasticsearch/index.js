import elasticsearch from 'elasticsearch'

let config = function () {
    return {
        host: 'localhost:9200',
        log: 'trace',
        apiVersion: '2.2'
    }
}

let ESClient = function () {
    return new elasticsearch.Client(config());
}

export const search = function (parameters) {
    var client = ESClient() // eslint-disable-line
    return client.search(parameters);
}

export const ping = function (parameters) {
    var client = ESClient(); // eslint-disable-line
    return client.ping(parameters);
}
