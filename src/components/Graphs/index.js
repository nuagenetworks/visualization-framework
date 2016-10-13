import SimpleTextGraph from "./SimpleTextGraph";

// TODO delete this one.
import VerticalBarGraph from "./VerticalBarGraph";

import BarGraph from "./BarGraph";
import Table from "./Table";

/*
    Stores all graphs.
*/
let registry = {
    SimpleTextGraph: SimpleTextGraph,
    VerticalBarGraph: VerticalBarGraph,
    BarGraph: BarGraph,
    Table: Table
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


export const GraphManager = {
    register: register,
    getGraphComponent: getGraphComponent,
}
