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
  port: process.env.APP_SERVER_PORT || 8010,
  ip: process.env.APP_SERVER_IP || '0.0.0.0',
  release: require('../../package.json').version,
  baseDir: path.normalize(__dirname + '/../..'),

  apiPrefix: '/api',
};

export default defaultConfig;
