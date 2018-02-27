import SimpleTextGraph from "./SimpleTextGraph"
import VariationTextGraph from "./VariationTextGraph"
import BarGraph from "./DynamicBarGraph"
import LineGraph from "./LineGraph"
import MultiLineGraph from "./LineGraph"
import PieGraph from "./PieGraph"
import Table from "./Table"
import ChordGraph from "./ChordGraph"
import GaugeGraph from "./GaugeGraph"
import HeatmapGraph from "./HeatmapGraph"
import AreaGraph from "./AreaGraph"
import DynamicBarGraph from "./DynamicBarGraph"
import GeoMap from "./GeoMap"

import { theme } from "../../theme"

/*
    Stores all graphs.
*/
let registry = {
    SimpleTextGraph,
    BarGraph,
    LineGraph,
    MultiLineGraph,
    Table,
    PieGraph,
    ChordGraph,
    GaugeGraph,
    VariationTextGraph,
    HeatmapGraph,
    AreaGraph,
    DynamicBarGraph,
    GeoMap
};

/*
    Registers a new graph for a given name
*/
const register = function (graph, name) {
    registry[name] = graph;
}

/*
    Get the graph component registered for the given name
*/
const getGraphComponent = function (name) {
    if (!(name in registry))
        throw new Error("No graph named " + name + " has been registered yet!" );

    return registry[name];
}


// Define all default properties for graphs
const defaults = {
    loadSpeed: 300,
    margin: { top: 10, bottom: 10, left: 10, right: 10 },
    padding: 0.1,
    yTickGrid: true,
    yTickFontSize: 12,
    yTickSizeInner: 6,
    yTickSizeOuter: 0,
    yLabel: false,
    xColumnLabelPosition: 17,
    yLabelSize: 14,
    xTickGrid: false,
    xTickFontSize: 12,
    xTickSizeInner: 6,
    xTickSizeOuter: 0,
    xLabel: false,
    yColumnLabelPosition: 5,
    yAxisPadding: 2,
    xLabelSize: 14,
    dateHistogram: false,
    interval: "30s",
    otherMinimumLimit: 10,
    colors: [theme.palette.blueColor],
    fontColor: theme.palette.blackColor,
    fontSize: "1em",
    stroke: {
        color: theme.palette.whiteColor,
        width: "1px"
    },
    chartWidthToPixel: 6,           // Default value to convert a character's width into pixel
    chartHeightToPixel: 14,         // Default value to convert a character's height into pixel
    circleToPixel: 3,               // Default value to convert the circle to pixel
    legend: {
        show: true,                 // Show or not the legend style
        orientation: 'vertical',    // Orientation between 'vertical' and 'horizontal'
        circleSize: 4,              // Size in pixel of the circle
        labelOffset: 2,             // Space in pixels between the circle and the label
    }
}

const getDefaultProperties = (properties) => {
    return Object.assign({}, defaults, properties);
};


export const GraphManager = {
    register: register,
    getGraphComponent: getGraphComponent,
    getDefaultProperties: getDefaultProperties,
}
