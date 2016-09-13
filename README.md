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
