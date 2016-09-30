import SimpleTextGraph from "./SimpleTextGraph";
import ImageGraph from "./ImageGraph";
import VerticalBarGraph from "./VerticalBarGraph";

/*
    Stores all graphs.
*/
let registry = {
    SimpleTextGraph: SimpleTextGraph,
    ImageGraph: ImageGraph,
    VerticalBarGraph: VerticalBarGraph
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
