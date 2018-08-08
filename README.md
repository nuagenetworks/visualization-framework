This project is based on the [create-react-app template](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md).

# Generic Setup
## Installation Procedure

    1. Clone the repository https://github.com/nuagenetworks/visualization-framework
    2. Go inside the `visualization-framework` folder
    3. Install all dependancies using `npm install` (it will take some time, please be patient)
    4. Run the application using `npm run start` command.
    5. Launch tests using `npm run test` command.

## Visualization
    1. Go to http://localhost:3000/dashboards/medals to see charts

## Building your visualization app
    - under construction

# Nuage Networks specific setup
## ElasticSearch CORS Setup

This project works with ElasticSearch directly from the Browser. In order for this software to access your ElasticSearch instance, you'll need to configure the ElasticSearch [CORS](https://en.wikipedia.org/wiki/Cross-origin_resource_sharing) setting to be open.

To do this, first locate your `elasticsearch.yml` file. In Ubuntu Linux, this file is located at `/etc/elasticsearch/elasticsearch.yml`. In this file, add the following lines:

```yml
http.cors.enabled: true
http.cors.allow-origin: "*"
```

This configuration allows any origin to access your ElasticSearch instance, which is fine for development but not recommended for production as it introduces a security vulnerability.

After editing this file, restart ElasticSearch.

`sudo service elasticsearch restart`

## Installation Procedure

    1. Clone the repository https://github.com/nuagenetworks/visualization-framework
    2. Go inside the `visualization-framework` folder
    3. Install all dependancies using `npm install` (it will take some time, please be patient)
    4. Run the application using `npm run start` command.
    5. Launch tests using `npm run test` command.

## Settings

Here is a list of environment variable that can be set to configure the visualization framework:

    * `REACT_APP_ELASTICSEARCH_HOST` (**required**) allows you to specify the Elastic Search server (ex: http://localhost:9200)
    * `REACT_APP_VSD_API_ENDPOINT` allows to specify the VSD API endpoint (ex:https://vsd.com:8443/nuage/api/)
    * `REACT_APP_CACHING_CONFIG_TIME` allow to override caching of json configuration in milliseconds (ex:900000)
    * `REACT_APP_CACHING_QUERY_TIME` allow to override caching of services data( elasticsearch, VSD etc.) in milliseconds (ex:5000)
    * `REACT_APP_REFRESH_INTERVAL` allow to override refresh interval in milliseconds (ex:30000)


## kitchenSink

    $ curl http://localhost:9200/_cat/indices?pretty
    yellow open nuage_event                    5 1 10224000 0 547.5mb 547.5mb
    yellow open nuage_flow                     5 1 10224000 0   1.3gb   1.3gb
    yellow open nuage_dpi_flowstats_2016_10_12 5 1  1846654 0 673.3mb 673.3mb

    $ curl localhost:9200/nuage_dpi_flowstats_2016_10_12/_search?pretty
    > Locate enterpriseName and sourceNSG (snsg)


    | Name   |  Graph  |     parameters     |
    |--------|:-------------:|------:|
    | Top 5 apps          | Vertical Bar Chart   | startTime=now-90d                                                 |
    | Top 5 apps          | Horizontal Bar Chart | startTime=now-90d                                                 |
    | Top 5 apps          | Table                | startTime=now-90d                                                 |
    | Top 5 apps          | Pie Chart            | startTime=now-90d                                                 |
    | Top 5 apps          | Donut Chart          | startTime=now-90d                                                 |
    | Flows per domain    | Chord diagram        | startTime=now-90d                                                 |
    | Flows per domain    | Chord diagram        | startTime=now-90d                                                 |
    | Effective Score     | Simple text Graph    | startTime=now-90d                                                 |
    | ACL Hits vs Time    | Line Graph           | startTime=now-90d                                                 |
    | Multi-line Example  | Line Graph           | startTime=now-90d&enterpriseName=test_org&domainName=chord_domain |

URL Examples:
-   http://localhost:3000/dashboards/kitchenSink?startTime=now-90d
-   http://localhost:3000/dashboards/kitchenSink?startTime=now-90d&snsg=ovs-17&enterpriseName=test_org
