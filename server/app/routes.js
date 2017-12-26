import { Router } from 'express';

import IndexController from './controllers/index.controller';
import DashboardsController from './controllers/dashboards.controller';
import VisualizationsController from './controllers/visualizations.controller';
import TestingController from './controllers/testing.controller';
import errorHandler from './middleware/error-handler';

const routes = new Router();

routes.get('/', IndexController.index);

// Users
routes.get('/dashboards/:dashboard', DashboardsController.index);
routes.get('/visualizations/:visualization', VisualizationsController.index);
routes.post('/visualizations/fetch/:visualization', VisualizationsController.fetch);

// testing routes
routes.post('/testing/reports', TestingController.reports);
routes.get('/testing/reports/:report_id', TestingController.detail);
routes.post('/testing/update/reports', TestingController.updateDataSet);
routes.get('/testing/reports/delete/:report_id', TestingController.deleteReports);
routes.post('/testing/initiate', TestingController.initiate);

routes.use(errorHandler);

export default routes;
