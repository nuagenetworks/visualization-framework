import BaseController from './base.controller';
import {DirectoryTypes, FetchManager} from '../lib/utils/fetch';


class DashboardsController extends BaseController {
  index = async (req, res, next) => {
    let { dashboard } = req.params;

    try {
      let dasboardData = FetchManager.fetchAndParseJSON(dashboard, DirectoryTypes.DASHBOARD);

      if(dasboardData.visualizations) {
        dasboardData.visualizations.forEach((visualization, index, array) => {
          dasboardData.visualizations[index].visualization = FetchManager.fetchAndParseJSON(visualization.id, DirectoryTypes.VISUALIZATION);
          if(dasboardData.visualizations[index].visualization.query)
            dasboardData.visualizations[index].query = FetchManager.fetchAndParseJSON(dasboardData.visualizations[index].visualization.query, DirectoryTypes.QUERY);
        });
      }

      res.json(dasboardData);
    } catch(err) {
      next(err);
    }
  }
}

export default new DashboardsController();
