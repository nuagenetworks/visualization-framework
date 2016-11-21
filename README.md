This project is based on the [create-react-app template](https://github.com/facebookincubator/create-react-app/blob/master/template/README.md).

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

    * `REACT_APP_ELASTICSEARACH_HOST` allows you to specify the Elastic Search server (ex: http://localhost:9200)
    * `REACT_APP_VSD_API_ENDPOINT` allows to specify the VSD API endpoint (ex:https://vsd.com:8443/nuage/api/)


## kitchenSink

    $ curl http://localhost:9200/_cat/indices?pretty
    yellow open nuage_event                    5 1 10224000 0 547.5mb 547.5mb
    yellow open nuage_flow                     5 1 10224000 0   1.3gb   1.3gb
    yellow open nuage_dpi_flowstats_2016_10_12 5 1  1846654 0 673.3mb 673.3mb

    $ curl localhost:9200/nuage_dpi_flowstats_2016_10_12/_search?pretty
    > Locate enterpriseName and sourceNSG

    Open your browser with the following URL:
    `http://localhost:3000/dashboards/kitchenSink?startTime=now-90d&snsg={sourceNSG:ovs-17}&EnterpriseName={enterpriseName:test_org}`
