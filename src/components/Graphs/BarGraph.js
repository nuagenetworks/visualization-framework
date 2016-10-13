import React from "react";
import ReactDOM from "react-dom";

import tabify from "../../utils/tabify";
import * as d3 from "d3";
import "./BarGraph.css";

export default class BarGraph extends React.Component {
    render() {

        const { response, configuration, onBarClick } = this.props;
        const { width, height } = this.props;

        if (!response || response.error)
            return;

        const data = tabify(response.results);
        const properties = configuration.data;
        
        return (
            <div className="bar-graph">
                <svg width={width} height={height}>
                    {data.map((d, i) => (
                        <rect
                            x={i*50}
                            y="0"
                            width="40"
                            height="40"
                        />
                    ))}
                </svg>
            </div>
        );
    }
}

BarGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
