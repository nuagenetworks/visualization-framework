import React from "react";

import graph1 from "../../images/graph1.png"
import graph2 from "../../images/graph2.png"
import graph3 from "../../images/graph3.png"
import graph4 from "../../images/graph4.png"

function getGraph(name) {
    switch(name) {
        case "graph1":
            return graph1;
        case "graph2":
            return graph2;
        case "graph3":
            return graph3;
        case "graph4":
        default:
            return graph4;
    }
};

class ImageGraph extends React.Component {
    render() {
        const { id } = this.props;
        return (
            <div>
                <img src={getGraph(id)} alt={id} width="100%" height="100%" />
            </div>
        );
    }
}

export default ImageGraph;
