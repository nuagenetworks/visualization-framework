import React from "react";
import ReactDOM from "react-dom";

import tabify from "../../utils/tabify";
import * as d3 from "d3";
import "./BarGraph.css";

export default class BarGraph extends React.Component {
    constructor(){
        super();

        // These properties can be overridden from the configuration.
        this.defaults = {
          margin: { top: 15, bottom: 20, left: 30, right: 20 },
          padding: 0.1,
          yTickGrid: true,
          yTickSizeInner: 6,
          yTickSizeOuter: 0,
          xTickGrid: false,
          xTickSizeInner: 6,
          xTickSizeOuter: 0,
          orientation: "horizontal"
        };
    }

    // Gets the object containing all configured properties.
    // Uses properties from the configuration,
    // falling back to defaults for unspecified properties.
    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }

    render() {

        const {
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

        const {
          xColumn,
          yColumn,
          margin: { top, bottom, left, right },
          padding,
          yTickGrid,
          yTickSizeInner,
          yTickSizeOuter,
          xTickGrid,
          xTickSizeInner,
          xTickSizeOuter,
          orientation
        } = this.getConfiguredProperties();


        const horiz = orientation === "horizontal";
        const xScale = horiz ? d3.scaleBand() : d3.scaleLinear();
        const yScale = horiz ? d3.scaleLinear() : d3.scaleBand();
        const xAxis = d3.axisBottom(xScale);
        const yAxis = d3.axisLeft(yScale);

        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;

        xScale
          .domain(data.map(function (d){ return d[xColumn]; }))
          .range([0, innerWidth])
          .padding(padding);
        
        yScale
          .domain([0, d3.max(data, function (d){ return d[yColumn] })])
          .range([innerHeight, 0]);

        yAxis.tickSizeInner(yTickGrid ? -innerWidth : yTickSizeInner);
        yAxis.tickSizeOuter(yTickSizeOuter);
        xAxis.tickSizeInner(xTickGrid ? -innerHeight : xTickSizeInner);
        xAxis.tickSizeOuter(xTickSizeOuter);

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
