import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import morgan from 'morgan';
import helmet from 'helmet';

import routes from './routes';
import Constants from './configurations/constants';

const app = express();

// Securing express APPs
app.use(helmet());

// Enabling CORS
app.use(cors());

// Request logger
if (!Constants.envs.test) {
  app.use(morgan('dev'));
}

// Parse incoming request bodies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Lets you use HTTP verbs such as PUT or DELETE
app.use(methodOverride());

// Mount API routes
app.use(Constants.apiPrefix, routes);

app.listen(Constants.port, () => {
  // eslint-disable-next-line no-console
  console.log(`
    Port: ${Constants.port}
    Env: ${app.get('env')}
  `);
});

export default app;
