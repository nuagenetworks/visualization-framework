Welcome to the documentation!

The philosophy of the Visualization Framework is to provide a library to quickly shows your dashboards.
**Dashboards** are split into multiple Visualizations. Each **Visualization** is making a **Query** to retrieve and display its data.


## Table of Contents

- [File structure](#file-structure)
- [Configuration files](#configuration-files)
  - [Dashboard configuration](#dashboard-configuration)
  - [Visualization configuration](#visualization-configuration)
    - [Tooltips](#tooltips)
    - [Listeners](#listeners)
    - [Supported Graphs](#supported-graphs)
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
 - **links** allows you to specify a list of links to navigate to another page
   - **labeL** label of the link
   - **url** url of the link
 - **filterOptions** allows you to specify a list of filters. Filters will be displayed as a dropdown list. Each time the user clicks on a link, it updates the `context` based on the information provided.
   - **name** name of the filter. In the example below, name is "Time interval"
     - **parameter** name of the parameter in the `context`
     - **default** default value to set in the `context`
     - **disabled** `true` to disable the dropdown list. Default is `false`
     - **options** a list of options that will be displayed in the dropdown list
       - **label** label of the item in the dropdown menu
       - **value** value associated to the  **parameter** when item option is clicked

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
    ],
    "links": [
        {
            "label": "First Dasbhoard",
            "url": "/dashboards/myFirstDashboard"
        },
        {
            "label": "Second Dashboard",
            "url": "/dashboards/mySecondDashboard"
        }
    ],
    "filterOptions": {
        "Time interval": {
            "parameter": "startTime",
            "default": "now-24h",
            "options": [
                {
                    "label": "Last 15 min",
                    "value": "now-15m"
                },
                {
                    "label": "Last 24h",
                    "value": "now-24h"
                }
            ]
        }
    }
}
```

> Try to find a way to quickly understand what the dashboard or visualization configuration is about by choosing a clear file name. When dealing with huge configuration files, it can be tricky to find the one you are looking for.

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
- **query*** (object | string) identifier of the query to execute for this visualization, it can be one or more than one, for objects key will be passed as data to all the graphs e.g. 
    ```
    query: {
        data: "query1",
        data2: "query2"
    }
    ```
    Note: data key is required in case of object.

- **refreshInterval** set the time interval in `ms` between two refresh. Use `-1` to deactivate refresh.
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
- **filterOptions** allows to set filters on the visualization. See dashboard configuration for more information as it is working the same way!


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


#### Tooltips
Visualization Framework supports tooltips on the following components:
- BarGraph
- PieGraph
- LineGraph [TO COMPLETE]
- Table [TO COMPLETE]
- ChordGraph [TO COMPLETE]

You want to add tooltips on an existing visualization ? Update its configuration:

- **tooltip** list of tooltip options
  - **column*** attribute name to use to display the value
  - **label** tooltip label. If not specified, column will be used.
  - **format** [d3 format](https://github.com/d3/d3-format) style to display the column value

```javascript
{
    // ...
    "data": {
        // ...
        "tooltip": [
            { "column": "L7Classification", "label": "L7 Signature" },
            { "column": "Sum of MB", "format": ",.2s"}
        ]
    }
    // ...
}
```

> The example above will display will display a tooltip with 2 lines (See picture below)
![tooltip](https://cloud.githubusercontent.com/assets/1447243/21205464/492fbc8c-c211-11e6-94f4-e22e96299fcf.png)


#### Listeners
If you want to allow your users to interact with your dashboards, you will need to set some listeners.

Listeners are pretty basic. It allows you to define:
- **redirect** url to go to when you click on a graph
- **params** parameters to pass to the `context`

```javascript
{
    // ...
    "data": {}
    "listeners": [
        {
            "redirect": "/dashboards/mySecondDashboard",
            "params": {
                "app": "L7Classification"
            }
        }
    ]
}
```

> Do you want your user to navigate to a new page or stay in the current dashboard ?
> Adapt your listeners depending on what you want to achieve.
- Provide `redirect` if you want to go to another page or dashboard.
- If you want to update the context in order to display a new graph that was previously hidden, do not use `redirect`. Use `params` to update the current `context`.
- Provide `params` and `redirect` if you want to change to another page and update the current `context`


#### Supported Graphs
The Visualization Framework comes with pre-defined graphs. Each graphs has its own parameters


##### BarGraph
Display vertical or horizontal bar charts

![horizontal-bar](https://cloud.githubusercontent.com/assets/1447243/21204889/568e166a-c20e-11e6-8c8e-5da32f5d9966.png)


- **orientation** orientation of the graph. Default is `vertical`. Set to `horizontal` to have an horizontal bar chart.
- **dateHistogram** [TO COMPLETE]
- **interval** [TO COMPLETE - looks related to dateHistogram]

__x-axis__

- **xColumn** attribute name in your results to use for x-axis
- **stackColumn** (optional) To show stacked Bar Charts
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
Display one or multiple lines

![multiline-chart](https://cloud.githubusercontent.com/assets/1447243/21205460/4672e4a6-c211-11e6-88a5-269bc32d2140.png)

- **linesColumn** attribute name in your results to display line value
- **showNull** (Boolean) If false, Show truncated line if yValue is null . Default is true
- **defaultY** (string | object) default yAxis value used to draw straight horizontal line to show cut off value. It can be object which define data `source` and `column` to get data from another query and you may define separate `tooltip` for this staright line from data `source`. Example - 
```javascript
 {
     `"defaultY": {
         "source": "data2",
         "column": "memory",
         "tooltip": [
             { "column": "memory", "label": "memory"},
             { "column": "cpu", "label": "cpu"}
         ]
     }
 }
 ```

See x-axis and y-axis sections in BarGraph for more information


##### PieGraph
Display nice Pie or Donut graphs

![donut](https://cloud.githubusercontent.com/assets/1447243/21204886/5327c232-c20e-11e6-95ca-cdab285c749e.png)

- **pieInnerRadius** inner radius of the slices. Make this non-zero for a Donut Chart
- **pieOuterRadius** outer radius of the slices
- **pieLabelRadius** radius for positioning labels
- **otherOptions** optional object
  - **type** Value must be percentage or number, and default is percentage
  - **limit** As per the type we can define the limit in percentage or slices respectively.
  - **minimum** In case of percentage, if we want to override the mimium slices of 10.


##### Table
- **width** width of the table. Default is `100%`
- **selectable** - To enable/disable selectable feature - Default is `true`
- **multiSelectable** To enable/disable multi select feature - default is `false`
- **showCheckboxes** To show checkboxes to select rows - default is `false`
- **enableSelectAll** To enable/disable select all feature - Default is `true`
- **selectedColumn** (string) Compare `selectedColumn` value with all available datas and if equal to selected row, then save all matched records in store under "matchedRows"
- **selectColumnOption** (Boolean) To show columns selection dropdown set this value to `true` (default is `false`).
In Columns array set `display: false` to hide any column (default is true, i.e. column will display inside the table if `display` is missing or set to `true`).
- **highlight** (Array of columns) Highlighted the rows if value of columns is not null
- **hidePagination** Hide paging and search bar if data size is less than pagination limit - Default is `true`
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

- **targetedColumn** name of the attribute to use to display the value. If not specified, this graph will display the length of the result
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
        "resourceName": "{{resourceName:defaultName}}",
        "methodName": "{{methodName:call('demo')}}"
    }
}
```

The query configuration will be "contextualized" which means:

- if the `context` contains a parameter named `resourceName`, the query will send its value
- if the `context` does NOT contain `resourceName`, the value sent will be `defaultName`
- ###### Custom Translator
    - You can also call the custom `Translator` placed at `\utils\translators\`, e.g. in above example translator `demo` will get called with value passed as parameter named as `methodName` in the URL.
    - Just wrap the translator name inside `call` method.
    - You can also add your custom translators by adding respective file inside `\utils\translators` and register it inside `\utils\translators\index.js`

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
- **tabify(response)** transforms your service responses into a array-like result. If no tabify method is defined, the response will be treated as it is.


### How to use my service ?
Once you have created your service, you will need to let the Visualization Framework how to use it.
Just tell `ServiceManager` that you want to register the service using the following syntax:

```javascript
    import { ServiceManager } from "opensource-vf";
    ServiceManager.register(ElasticSearchService, "elasticsearch");
```

The second argument is optional. If you do not provide a name, the service identifier will be automatically used.
