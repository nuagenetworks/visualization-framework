import Constants from '../../configurations/constants';

import fs from 'fs';
import path from 'path';

export const DirectoryTypes = {
  DASHBOARD: 'dashboards',
  QUERY: 'queries',
  VISUALIZATION: 'visualizations',
  MEMORY: 'memory',
  DATASET: 'dataset',
};

const configPath = `${Constants.baseDir}/app/configurations`;

const fetchJSON = function(file, type) {
  let fileContent;
  try {
    fileContent = fs.readFileSync(
      path.resolve(configPath, type, `${file}.json`),
      'utf8');
    return fileContent;
  } catch (err) {
    return false;
  }
};

const parseJSON = function(content) {
  return JSON.parse(content);
};

const fetchAndParseJSON = function(file, type) {
  let content = fetchJSON(file, type);
  return (content) ? parseJSON(content) : false;
};

export const FetchManager = {
  fetchJSON: fetchJSON,
  parseJSON: parseJSON,
  fetchAndParseJSON: fetchAndParseJSON,
};
