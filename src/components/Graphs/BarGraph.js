import React from "react";
import ReactDOM from "react-dom";

import tabify from "../../utils/tabify";
import * as d3 from "d3";
import "./BarGraph.css";

export default class BarGraph extends React.Component {
    constructor(){
        super();
        this.xScale = d3.scaleBand();
        this.yScale = d3.scaleLinear();

        // These are properties that can be overridden from the configuration.
        this.defaults = {
          margin: { top: 15, bottom: 20, left: 30, right: 20 },
          padding: 0.1
        };
    }
    render() {

        const {
          xScale,
          yScale,
          defaults,
          props: {
            response,
            configuration,
            onBarClick,
            width,
            height
          }
        } = this;

        if (!response || response.error)
            return;

        const data = tabify(response.results);

        // Use properties from the configuration,
        // using defaults for unspecified properties.
        const properties = Object.assign({}, defaults, configuration.data);

        const {
          xColumn,
          yColumn,
          margin: {
            top,
            bottom,
            left,
            right
          },
          padding
        } = properties;

        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;

        xScale
          .domain(data.map(function (d){ return d[xColumn]; }))
          .range([0, innerWidth])
          .padding(padding);
        
        yScale
          .domain([0, d3.max(data, function (d){ return d[yColumn] })])
          .range([innerHeight, 0]);

        return (
            <div className="bar-graph">
                <svg width={width} height={height}>
                    <g transform={ `translate(${left},${top})` } >
                        {data.map((d, i) => (
                            <rect
                                key={ i }
                                x={ xScale(d[xColumn]) }
                                y={ yScale(d[yColumn]) }
                                width={ xScale.bandwidth() }
                                height={ innerHeight - yScale(d[yColumn]) }
                            />
                        ))}
                    </g>
                </svg>
            </div>
        );
    }
}

BarGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
