import React from "react";

import tabify from "../../utils/tabify";
import * as d3 from "d3";

export default class LineGraph extends React.Component {
    constructor(){
        super();

        // These properties can be overridden from the configuration.
        // TODO unify these at a base class inherited by both bar chart and line chart.
        this.defaults = {
          margin: { top: 15, bottom: 20, left: 30, right: 20 },
          yTickGrid: true,
          yTickSizeInner: 6,
          yTickSizeOuter: 0,
          xTickGrid: false,
          xTickSizeInner: 6,
          xTickSizeOuter: 0,
          interval: "30s"
        };
    }

    // Gets the object containing all configured properties.
    // Uses properties from the configuration,
    // falling back to defaults for unspecified properties.
    // TODO move this to a base class
    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }

    render() {

        const { response, width, height } = this.props;

        if (!response || response.error)
            return;

        const data = tabify(response.results);

        const {
          xColumn,
          yColumn,
          margin: { top, bottom, left, right },
          yTickGrid,
          yTickSizeInner,
          yTickSizeOuter,
          xTickGrid,
          xTickSizeInner,
          xTickSizeOuter,
          interval
        } = this.getConfiguredProperties();

        const xScale = d3.scaleTime()
          .domain(d3.extent(data, function (d){ return d[xColumn]; }));
        const yScale = d3.scaleLinear()
          .domain(d3.extent(data, function (d){ return d[yColumn] }));

        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;

        xScale.range([0, innerWidth]);
        yScale.range([innerHeight, 0]);

        const xAxis = d3.axisBottom(xScale)
          .tickSizeInner(xTickGrid ? -innerHeight : xTickSizeInner)
          .tickSizeOuter(xTickSizeOuter);

        const yAxis = d3.axisLeft(yScale)
          .tickSizeInner(yTickGrid ? -innerWidth : yTickSizeInner)
          .tickSizeOuter(yTickSizeOuter);

        const line = d3.line()
          .x(function(d) { return xScale(d[xColumn]); })
          .y(function(d) { return yScale(d[yColumn]); });

        
        // TODO see about moving this into configuration.
        const lineStyle = {
            fill: "none",
            stroke: "black",
            strokeWidth: "5px"
        }

        return (
            <div className="bar-graph">
                <svg width={width} height={height}>
                    <g transform={ `translate(${left},${top})` } >
                        <g
                            key="xAxis"
                            ref={ (el) => d3.select(el).call(xAxis) }
                            transform={ `translate(0,${innerHeight})` }
                        />
                        <g
                            key="yAxis"
                            ref={ (el) => d3.select(el).call(yAxis) }
                        />
                        <path style={lineStyle} d={line(data)} />
                    </g>
                </svg>
            </div>
        );
    }
}
LineGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
