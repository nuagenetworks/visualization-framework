import path from 'path';

const defaultConfig = {
  env: process.env.NODE_ENV,
  get envs() {
    return {
      test: process.env.NODE_ENV === 'test',
      development: process.env.NODE_ENV === 'development',
      production: process.env.NODE_ENV === 'production',
    };
  },
  port: process.env.MIDDLEWARE_SERVER_PORT || 8010,
  ip: process.env.MIDDLEWARE_SERVER_IP || 'localhost',
  release: require('../../package.json').version,
  baseDir: path.normalize(__dirname + '/../..'),

  apiPrefix: '/middleware/api',
};

export default defaultConfig;
