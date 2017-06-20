import BaseController from './base.controller';
import Constants from '../configurations/constants';
import { DirectoryTypes, FetchManager } from '../lib/utils/fetch';

import { ServiceManager } from "../lib/servicemanager/index"
import { parameterizedConfiguration } from '../lib/utils/configurations'

class VisualizationsController extends BaseController {

  index = async (req, res, next) => {
    let { visualization } = req.params;

    try {
      let visualizationConfig = FetchManager.fetchAndParseJSON(visualization, DirectoryTypes.VISUALIZATION);
      if(visualizationConfig && visualizationConfig.query) {
        visualizationConfig.queryConfiguration = FetchManager.fetchAndParseJSON(visualizationConfig.query, DirectoryTypes.QUERY);
      } else if(visualizationConfig.script) {
        visualizationConfig.queryConfiguration = ServiceManager.executeScript(visualizationConfig.script);
      }

      return res.json(visualizationConfig);
    } catch(err) {
      next(err);
    }
  }

  fetch = async (req, res, next) => {
    let { visualization } = req.params;
    let context = req.body;

    try {
      let visualizationConfig = FetchManager.fetchAndParseJSON(visualization, DirectoryTypes.VISUALIZATION);
      let queryConfig = null;

      if(visualizationConfig.query)
        queryConfig = FetchManager.fetchAndParseJSON(visualizationConfig.query, DirectoryTypes.QUERY);
      else if(visualizationConfig.script)
        queryConfig = ServiceManager.executeScript(visualizationConfig.script);

      //If neither query and nor script
      if(!queryConfig)
        next(this.formatError('Unkown service', 422));

      //Fethcing the service manager
      let service = ServiceManager.getService(queryConfig.service);

      //Not able to reterive service from Service Manager
      if(!service)
        next(this.formatError('Cant find the mentioned service', 422));

      //If context on body then parameterized the query
      if (context) {
        const pQuery = parameterizedConfiguration(queryConfig, context);

        if (pQuery)
          queryConfig = pQuery;
        else
        return res.json([]);
      }

      //Executing the Service Fetch to reterive the response.
      service.fetch(queryConfig, context).then(function(result) {
        if(service.tabify)
          result = service.tabify(result);

         return res.json(result);
      }, function(err) {
         //return res.json([]);
         next(err);
      })

    } catch(err) {
      next(err);
    }
  }
}

export default new VisualizationsController();
