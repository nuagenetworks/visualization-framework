import BaseController from './base.controller';
import Constants from '../config/constants';

import fs from 'fs';
import path from 'path';

class DashboardsController extends BaseController {
  index = async (req, res, next) => {
    let { dashboard } = req.params;

    const configPath = `${Constants.baseDir}/../public/configurations`;
    const dashboardDir = 'dashboards';
    const visualizationDir = 'visualizations';

    try {
      let fileContent = fs.readFileSync(
        path.resolve(configPath, dashboardDir, `${dashboard}.json`),
        'utf8');

      let dasboardData = JSON.parse(fileContent);

      if(dasboardData.visualizations) {
        dasboardData.visualizations.forEach((visualization, index, array) => {
          let visualizationData = fs.readFileSync(
            path.resolve(configPath, visualizationDir, `${visualization.id}.json`),
            'utf8');
          dasboardData.visualizations[index].detail = JSON.parse(visualizationData);
        });
      }

      res.json(dasboardData);
    } catch(err) {
      next(err);
    }
  }
}

export default new DashboardsController();
