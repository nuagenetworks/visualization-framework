import { Router } from 'express';

import IndexController from './controllers/index.controller';
import DashboardsController from './controllers/dashboards.controller';
import VisualizationsController from './controllers/visualizations.controller';

import errorHandler from './middleware/error-handler';

const routes = new Router();

routes.get('/', IndexController.index);

// Users
routes.get('/dashboards/:dashboard', DashboardsController.index);
routes.post('/visualizations/:visualization', VisualizationsController.fetch);

routes.use(errorHandler);

export default routes;
