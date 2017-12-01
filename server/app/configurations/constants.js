import path from 'path'
import readConfig from 'read-config'

const config = readConfig(path.resolve(__dirname, '../../config.json'));
var os = require("os");

const defaultConfig = {
  env: config.NODE_ENV,
  get envs() {
    return {
      test: config.NODE_ENV === 'test',
      development: config.NODE_ENV === 'development',
      production: config.NODE_ENV === 'production',
    };
  },
  port: config.MIDDLEWARE_SERVER_PORT || 8010,
  ip: config.MIDDLEWARE_SERVER_IP || os.hostname(),
  release: require('../../package.json').version,
  baseDir: path.normalize(__dirname + '/../..'),
  apiPrefix: config.APP_PREFIX || '/middleware/api',
  cert: config.HTTPS_CERT_PATH || null,
  key: config.HTTPS_KEY_PATH || null,
  elasticSearchHost: config.APP_ELASTICSEARCH_HOST || null,
  vsdApiEndPoint: config.REACT_APP_VSD_API_ENDPOINT || null
}

export default defaultConfig;
