import React from "react";

import AbstractGraph from "../AbstractGraph";

import tabify from "../../../utils/tabify";
import * as d3 from "d3";

import "./style.css";

export default class ChordGraph extends AbstractGraph {

    render() {

        const { response, width, height } = this.props;

        if (!response || response.error)
            return;

        const data = tabify(response.results);

        return (
            <div className="pie-graph">
                <svg width={ width } height={ height }>
                    <text>TODO make chord diagram</text>
                </svg>
            </div>
        );
    }
}
ChordGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
