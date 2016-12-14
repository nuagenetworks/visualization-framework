Welcome to the documentation!

The philosophy of the Visualization Framework is to provide a library to quickly shows your dashboards.
**Dashboards** are splitted into multiple Visualizations. Each **Visualization** is making a **Query** to retrieve and display its data.


## Table of Contents

- [File structure](#file-structure)
- [Configuration files](#configuration-files)
  - [Dashboard configuration](#dashboard-configuration)
  - [Visualization configuration](#visualization-configuration)
    - [BarGraph](#bargraph)
    - [LineGraph](#linegraph)
    - [PieGraph](#[piegraph)
    - [Table](#tablegraph)
    - [ChordGraph](#chordgraph)
    - [SimpleTextGraph](#simpletextgraph)
    - [VariationTextGraph](#variationtextgraph)
  - [Query configuration](#query-configuration)
- [Services](#services)


## File structure
This source is organized thanks to the great [create-react-app](https://github.com/facebookincubator/create-react-app) boilerplate.
The file structure follows the guide lines as suggested by the library:

- `/src` contains all sources
- `/public` contains static assets as well as configuration files


## Configuration files

Configuration files are placed within the `public` folder. Each file contains JSON description.

There are 3 types of configurations:

1. Dashboard configuration files
2. Visualization configuration files
3. Query configuration files


### Dashboard configuration

Here is the list of all the parameters

- **id*** dashboard identifier, also used as the filename
- **author** name of the author
- **creationDate** creation date
- **title*** title of the dashboard
- **visualizations*** list of visualizations to display within the dashboard
  - **id*** identifier of the visualization
  - **x*** x position of the visualization within the 12-columns grid dashboard
  - **y*** y position of the visualization within the dashboard
  - **minH** minimum height of the visualization if not static
  - **minW** minimum width of the visualization if not static
  - **static** `false` to create a resizable visualization, `true` if you want a static one. Default is `false`.

#### Example
```javascript
{
    "id": "myFirstDashboard",
    "author": "Christophe SERAFIN",
    "creationDate": "12/14/2016",
    "title": "My First Dashboard",
    "visualizations": [
        { "id": "statisticsLine1",    "x": 0, "y": 0,  "w": 12, "h": 15, "minW": 2, "minH": 12, "static": true},
        { "id": "statisticsBar1",     "x": 0, "y": 15, "w": 6,  "h": 15, "minW": 2, "minH": 12, "static": true}
    ]
}
```

#### Notes / Tips
Try to find a way to quickly understand what the dashboard or visualization configuration is about by choosing a clear file name. When dealing with huge configuration files, it can be tricky to find the one you are looking for.

- Use a prefix to ensure the configuration is used for a specific feature.
- Don't hesitate to put the type of visualization in its identifier to know if you are dealing with a line chart or a bar chart.


### Visualization configuration
Visualiation configuration is a little more complex as it has more options. But it is working the same way, so don't worry :)

Here is the list of options:
- **id*** identifier, also used as the filename
- **graph*** the type of graph the visualization should be (See below to find all supported graphs)
- **author** name of the author
- **creationDate** creation date
- **title*** title of the visualization
- **description*** a description of the visualization
- **query*** identifier of the query to execute for this visualization
- **data** an object that helps you configure your visualization. (See below to find graphs specific data).
  - **colorColumn** attribute name in your results to use for color
  - **padding**
     - **top** set top padding in pixels
    - **bottom** set bottom padding in pixels
    - **right** set right padding in pixels
    - **left** set left padding in pixels
  - **margin**
    - **top** set top margin in pixels
    - **bottom** set bottom margin in pixels
    - **right** set right margin in pixels
    - **left** set left margin in pixels
  - **colors** list of colors to use to render the visualization
  - **stroke**
    - **width** define stroke width
    - **color** define stroke color
  - **legend**
    - **show** `true` to display legend. `false` otherwise. Default is `false`
    - **orientation** `vertical` or `horizontal` legend. Default is `vertical`
    - **circleSize** size of a legend circle. Default is `4` pixels
    - **labelOffset** space in pixel between the legend circle and its label. Default is `2`
  - **tooltip** list of tooltip parameters
- **listeners** list of listener to register to interact with the visualization
  - **redirect** url to another dashboard
  - **params** parameters to pass into the context of the next dashboard


#### Example
```javascript
{
    "id": "statisticsBar1",
    "graph": "BarGraph",
    "title": "Top 5 statistics",
    "description": "Shows top 5 statistics",
    "author": "Christophe SERAFIN",
    "creationDate": "12/14/2016",
    "query": "top5statistics",
    "data": {
        "margin": { "top": 10, "bottom": 10, "left": 10, "right": 10 },
        "padding": { "top": 8, "bottom": 8, "left": 8, "right": 8 },
        "colors": ["#1f77b4", "#ff7f0e", "#9467bd", "#e377c2"],
        "legend": {
            "show": true,
            "orientation": "vertical",
            "circleSize": 4,
            "labelOffset": 2
        },
        "tooltip": "See tooltip section",
    },
    "listeners": "See listeners section"
}
```

#### Supported Graphs
The Visualization Framework comes with pre-defined graphs. Each graphs has its own parameters


##### BarGraph
Display vertical or horizontal bar charts

![horizontal-bar](https://cloud.githubusercontent.com/assets/1447243/21204889/568e166a-c20e-11e6-8c8e-5da32f5d9966.png)


- **orientation** orientation of the graph. Default is `vertical`. Set to `horizontal` to have an horizontal bar chart.
- **dateHistogram** [TO COMPLETE]
- **interval** [TO COMPLETE - looks related to dateHistogram]

__x-axis__

- **xColumn*** attribute name in your results to use for x-axis
- **xLabel** x-axis title
- **xTicks** number of ticks to use for x-axis
- **xTickFormat** [d3 format](https://github.com/d3/d3-format) style to display x-axis labels
- **xTickGrid** [TO COMPLETE]
- **xTickSizeInner** [TO COMPLETE]
- **xTickSizeOuter** [TO COMPLETE]

__y-axis__

- **yColumn*** attribute name in your results to use for y-axis
- **yLabel** y-axis title
- **yTicks** number of ticks to use on y-axis
- **yTickFormat** [d3 format](https://github.com/d3/d3-format) style to display y-axis labels
- **yTickGrid** [TO COMPLETE]
- **yTickSizeInner** [TO COMPLETE]
- **yTickSizeOuter** [TO COMPLETE]


##### LineGraph
- **linesColumn** attribute name in your results to display line value

See x-axis and y-axis sections in BarGraph for more information


##### PieGraph
Display nice Pie or Donut graphs

![donut](https://cloud.githubusercontent.com/assets/1447243/21204886/5327c232-c20e-11e6-95ca-cdab285c749e.png)

- **pieInnerRadius** inner radius of the slices. Make this non-zero for a Donut Chart
- **pieOuterRadius** outer radius of the slices
- **pieLabelRadius** radius for positioning labels


##### Table
- **width** width of the table. Default is `100%`
- **border**
  - **top** set top border. Default is `solid 1px #ccc`
  - **bottom** set bottom border. Default is `0`
  - **right** set right border. Default is `0`
  - **left** set left border. Default is `0`
- **header** header specific parameters includes
  - **border** same as before
  - **fontColor** color of the header text


##### ChordGraph
- **outerPadding** [TO COMPLETE]. Default is `30`
- **arcThickness** [TO COMPLETE]. Default is `20`
- **padAngle** [TO COMPLETE]. Default is `0.07`
- **labelPadding**: [TO COMPLETE]. Default is `10`
- **transitionDuration** [TO COMPLETE]. Default is `500`
- **defaultOpacity**  [TO COMPLETE]. Default is `0.6`
- **fadedOpacity** [TO COMPLETE]. Default is `0.1`

##### SimpleTextGraph
This graph allows you to display a simple text information. Text ba

- **titlePosition** position title on `top` or at the `bottom` of the graph
- **textAlign** align text on `left`, `center` or `right`. Default is `center`
- **fontSize** font size
- **fontColor** font color
- **borderRadius** Set a radius if you want to display your text in a square or rounded area. Default is `50%`
- **innerWidth** define the percentage of the width for the area. `1` means 100% of the width. Default is `0.3`
- **innerHeight** define the percentage of the height for the area. `1` means 100% of the width. Default is `0.4`


##### VariationTextGraph
This graph shows a value and its variation from the previous one.

- **drawColor** color in case there is no variation
- **negativeColor** color in case the variation is lower than 0
- **positiveColor** color in case the variation is geater than 0
- **textAlign** align text on `left`, `center` or `right`. Default is `center`
- **fontSize** font size
- **fontColor** font color

### Query configuration
The query configuration allows the Visualization to know which [service](#services) it should use and what is the query it should trigger.

- **id** identifier, also used as the filename
- **title** title of the query
- **service** name of the service that has been registered
- **query** query object that will be "contextualized" and then sent to your service

```javascript
{
    "id":"top5statistics",
    "title":"Top 5 Statistics",
    "service":"elasticsearch",
    "query":{
        // The query information here depends on your service
    }
}
```

Important note: The visualization framework is using a `context` to determine all the information needed.
If you need to pass a specific parameter, check out this example:

```javascript
{
    "id":"top5statistics",
    "title":"Top 5 Statistics",
    "service":"elasticsearch",
    "query":{
        "resourceName": "{{resourceName:defaultName}}"
    }
}
```

The query configuration will be "contextualized" which means:

- if the `context` contains a parameter named `resourceName`, the query will send its value
- if the `context` does NOT contain `resourceName`, the value sent will be `defaultName`

Visualization Framework is using [json-templates](https://github.com/datavis-tech/json-templates) thanks to [@curran](https://github.com/curran),


## Services
A service is a Javascript Object that defines how to access a remote resource.
For instance, we have created a service named `elasticsearch` that allows us to make some query to our Elastic Search server.


### How it works ?
Each service must define some methods and expose them.

As an example, here is the structure of our `elasticsearch` service

```javascript
export const ElasticSearchService = {
    id: "elasticsearch",
    fetch: fetch,
    getRequestID: getRequestID,
    tabify: tabify
}
```

- **id*** identifier of the service
- **fetch(queryConfiguration, state)*** fetch is the method that will make the XHR request to the remote service. It takes two arguments:
  - `queryConfiguration` is the contextualized query configuration
  - `state` is the redux state. It will allow you to define some [redux thunks](https://github.com/gaearon/redux-thunk)
- **getRequestID(queryConfiguration, context)*** method that computes a unique string representing a request. The result will be stored in the redux state given this identifier.
- **tabify(response)** transformes your service responses into a tabified result. If no tabify method is defined, the response will be treated as it is.


### How to use my service ?
Once you have created your service, you will need to let the Visualization Framework how to use it.
Just tell `ServiceManager` that you want to register the service using the following syntax:

```javascript
    import { ServiceManager } from "opensource-vf";
    ServiceManager.register(ElasticSearchService, "elasticsearch");
```

The second argument is optional. If you do not provide a name, the service identifier will be automatically used.
