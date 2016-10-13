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
    }
    render() {

        const {
          xScale,
          yScale,
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
        const properties = configuration.data;
        const { xColumn, yColumn } = properties;

        xScale
          .domain(data.map(function (d){ return d[xColumn]; }))
          .range([0, width]);
        
        yScale
          .domain([0, d3.max(data, function (d){ return d[yColumn] })])
          .range([height, 0]);

        console.log(xScale.domain())
        console.log(xScale.range())
        
        return (
            <div className="bar-graph">
                <svg width={width} height={height}>
                    {data.map((d, i) => (
                        <rect
                            key={ i }
                            x={ xScale(d[xColumn]) }
                            y={ yScale(d[yColumn]) }
                            width={ xScale.bandwidth() }
                            height={ height - yScale(d[yColumn]) }
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
