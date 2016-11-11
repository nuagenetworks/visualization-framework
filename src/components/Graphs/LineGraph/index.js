import React from "react";

import AbstractGraph from "../AbstractGraph";

import tabify from "../../../utils/tabify";
import * as d3 from "d3";

export default class LineGraph extends AbstractGraph {

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
          yTickFormat,
          yTicks,
          xTickGrid,
          xTickSizeInner,
          xTickSizeOuter,
          xTickFormat,
          xTicks,
          stroke,
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

        if(xTickFormat){
            xAxis.tickFormat(d3.format(xTickFormat));
        }

        if(xTicks){
            xAxis.ticks(xTicks);
        }

        const yAxis = d3.axisLeft(yScale)
          .tickSizeInner(yTickGrid ? -innerWidth : yTickSizeInner)
          .tickSizeOuter(yTickSizeOuter);

        if(yTickFormat){
            yAxis.tickFormat(d3.format(yTickFormat));
        }

        if(yTicks){
            yAxis.ticks(yTicks);
        }

        const line = d3.line()
          .x(function(d) { return xScale(d[xColumn]); })
          .y(function(d) { return yScale(d[yColumn]); });


        // TODO see about moving this into configuration.
        const lineStyle = {
            fill: "none",
            stroke: stroke.color,
            strokeWidth: stroke.width,
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
                        <path style={ lineStyle } d={ line(data) } />
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
