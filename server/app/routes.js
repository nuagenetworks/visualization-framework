import { Router } from 'express';

import MetaController from './controllers/meta.controller';
import DashboardsController from './controllers/dashboards.controller';

import errorHandler from './middleware/error-handler';

const routes = new Router();

routes.get('/', MetaController.index);

// Users
routes.get('/dashboards/:dashboard', DashboardsController.index);

routes.use(errorHandler);

export default routes;
