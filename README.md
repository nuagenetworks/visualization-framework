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

## Git Submodules

This project relies on Git submodules. To initialize the project, you'll need to execute the following commands:

```
git submodule init
git submodule update
```

Then every time there is an update to the submodule, you should get the modification using:

```
git submodule update
```

## Installation Procedure

    1. Clone the repository https://github.com/nuagenetworks/visualization-framework
    2. Go inside the `visualization-framework` folder
    3. Initialize the submodule that deals with the configuration `git submodule init`
    4. Update the submodule to get the lastest sources `git submodule update`
    5. Install all dependancies using `npm install` (it will take some time, please be patient)
    6. Run the application using `npm run start` command.
