import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import methodOverride from 'method-override';
import morgan from 'morgan';
import helmet from 'helmet';
import fs from 'fs';
import https from 'https';
import http from 'http';

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
console.log(__dirname)
app.use(express.static(__dirname + '/../public'));

// Mount API routes
app.use(Constants.apiPrefix, routes);

app.get('/', function(req, res) {
  res.end('Welcome on the secure server !');
});

if(Constants.cert && Constants.key) {
  const sslOptions = {
    key: fs.readFileSync(Constants.key, 'utf8'),
    cert: fs.readFileSync(Constants.cert, 'utf8')
  }

  https.createServer(sslOptions, app).listen(Constants.port, Constants.ip, () => {
    // eslint-disable-next-line no-console
    console.log(`
      Port: ${Constants.port}
      Env: ${app.get('env')}
    `)

  })
} else {
  http.createServer(app).listen(Constants.port, Constants.ip, () => {
    // eslint-disable-next-line no-console
    console.log(`
      Port: ${Constants.port}
      Env: ${app.get('env')}
    `)

  })
}

export default app;
