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
      visualizationConfig.queryConfiguration = {}

      if(visualizationConfig && visualizationConfig.query) {
        let queries = typeof visualizationConfig.query === 'string' ? {'data' : visualizationConfig.query} :  visualizationConfig.query
        for(let query in queries) {
          if (queries.hasOwnProperty(query)) {
            visualizationConfig.queryConfiguration[query] = FetchManager.fetchAndParseJSON(queries[query], DirectoryTypes.QUERY);
          }
        }
      } else if(visualizationConfig.script) {
        visualizationConfig.queryConfiguration[visualizationConfig.script] = ServiceManager.executeScript(visualizationConfig.script);
      }
      return res.json(visualizationConfig);
    } catch(err) {
      next(err);
    }
  }

  fetch = async (req, res, next) => {
    let { visualization, query } = req.params;
    let context = req.body;

    try {
      let visualizationConfig = FetchManager.fetchAndParseJSON(visualization, DirectoryTypes.VISUALIZATION);
      let queryConfig = null;

      if(visualizationConfig.query) {

        let queries = typeof visualizationConfig.query === 'string' ? {'data' : visualizationConfig.query} :  visualizationConfig.query
        let queryExist = false
        for(let queryParam in queries) {
          if (queries.hasOwnProperty(queryParam) && queries[queryParam] === query) {
            queryExist = true
          }
        }

        if(!queryExist) {
          next(this.formatError(`${query} - Query not found`, 422));
        }

        queryConfig = FetchManager.fetchAndParseJSON(query, DirectoryTypes.QUERY);
      }
      else if(visualizationConfig.script) {
        queryConfig = ServiceManager.executeScript(visualizationConfig.script);
      }

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
         next(err);
      })

    } catch(err) {
      next(err);
    }
  }
}

export default new VisualizationsController();
