import path from 'path'
import readConfig from 'read-config'


const config = readConfig(path.resolve(__dirname, '../../config.json'));

const defaultConfig = {
  env: process.env.NODE_ENV,
  get envs() {
    return {
      test: process.env.NODE_ENV === 'test',
      development: process.env.NODE_ENV === 'development',
      production: process.env.NODE_ENV === 'production',
    };
  },
  port: config.APP_SERVER_PORT || 8010,
  ip: config.APP_SERVER_IP || 'localhost',
  release: require('../../package.json').version,
  baseDir: path.normalize(__dirname + '/../..'),
  apiPrefix: config.APP_PREFIX || '/middleware/api',
  cert: config.HTTPS_CERT_PATH || null,
  key: config.HTTPS_KEY_PATH || null,
  elasticSearchHost: config.APP_ELASTICSEARCH_HOST || null,
  vsdApiEndPoint: config.APP_VSD_API_ENDPOINT || null
}

export default defaultConfig;
