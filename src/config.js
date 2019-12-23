export default Object.freeze({
        ELASTICSEARCH_HOST: process.env.REACT_APP_ELASTICSEARCH_HOST || 'http://localhost:9200',
        VSD_API_ENDPOINT: process.env.REACT_APP_VSD_API_ENDPOINT || 'https://vsd.com:8443/nuage/api/',
        CACHING_CONFIG_TIME: process.env.REACT_APP_CACHING_CONFIG_TIME || 900000,
        CACHING_QUERY_TIME: process.env.REACT_APP_CACHING_QUERY_TIME || 30000,
        REFRESH_INTERVAL: process.env.REACT_APP_REFRESH_INTERVAL || 30000,
        DATA_PER_PAGE_LIMIT: process.env.DATA_PER_PAGE_LIMIT || 500,
        ES_SCROLL_TIME: process.env.ES_SCROLL_TIME || '3m',
        SCROLL_CACHING_QUERY_TIME: process.env.SCROLL_CACHING_QUERY_TIME || 180000,
});
export const CUSTOM_FILTER = 'custom';
export const DATE_RANGE = 86400000 * 6;
export const TIME_RANGE = 900000;
export const DATE = 'date';
export const TIME = 'time';
export const START_TIME = 'startTime';
export const END_TIME = 'endTime';
export const INTERVAL_LIST = [60, 120, 180, 300, 600, 900, 1800, 3600, 7200, 10800, 21600, 43200];
