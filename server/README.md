# Install dependencies
npm install

# Run it
npm start


## NPM Scripts

- **`npm start`** - Start live-reloading development server
- **`npm run build`** - Generate production ready application in `./build`

## Middleware APIs
    1. Dashboard Confirguration: GET http://HOSTNAME/api/dashboards/:dashboard-id
    2. Data API - POST http://HOSTNAME/api/visualizations/:visualization-id {refreshInterval: '-1'}
