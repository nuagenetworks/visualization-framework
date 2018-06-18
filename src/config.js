export default Object.freeze({
        ELASTICSEARCH_HOST: process.env.REACT_APP_ELASTICSEARCH_HOST || 'http://localhost:9200',
        VSD_API_ENDPOINT: process.env.REACT_APP_VSD_API_ENDPOINT || 'https://vsd.com:8443/nuage/api/',
        CACHING_CONFIG_TIME: process.env.REACT_APP_CACHING_CONFIG_TIME || 900000,
        CACHING_QUERY_TIME: process.env.REACT_APP_CACHING_QUERY_TIME || 30000,
        REFRESH_INTERVAL: process.env.REACT_APP_REFRESH_INTERVAL || 30000,
        DATA_LIMIT: process.env.DATA_LIMIT || 5000
})