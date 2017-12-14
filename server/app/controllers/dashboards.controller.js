import BaseController from './base.controller';
import { DirectoryTypes, FetchManager } from '../lib/utils/fetch';

import { ServiceManager } from "../lib/servicemanager/index"

class DashboardsController extends BaseController {
  index = async (req, res, next) => {
    let { dashboard } = req.params;

    try {
      let dasboardData = FetchManager.fetchAndParseJSON(dashboard, DirectoryTypes.DASHBOARD);
      let visualizations = [];
      let viz = null;
      if(dasboardData.visualizations) {
        
        dasboardData.visualizations.forEach((visualization, index, array) => {
          try {
            viz = FetchManager.fetchAndParseJSON(visualization.id, DirectoryTypes.VISUALIZATION);

            if(viz.query) {
              viz.queryConfiguration = FetchManager.fetchAndParseJSON(viz.query, DirectoryTypes.QUERY);
            } else if(viz.script) {
              viz.queryConfiguration = ServiceManager.executeScript(viz.script);
            }

            dasboardData.visualizations[index].visualization = viz;
            visualizations.push(dasboardData.visualizations[index]);
          } catch(err) {
            console.log(`ERROR OCCURED: Visualization configurations issue - ${err.message}`)
            //LOG ALL THE ERRORS HERE FOR ANY MISS CONFIGURATIONS
          }
        });
        dasboardData.visualizations = visualizations;
      } else {
        dasboardData.visualizations = [];
      }

      return res.json(dasboardData);
    } catch(err) {
      next(err);
    }
  }
}

export default new DashboardsController();
