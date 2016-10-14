import React from "react";

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
          orientation: "vertical",
          dateHistogram: false
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
          props: {
            response,
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
          orientation,
          dateHistogram
        } = this.getConfiguredProperties();


        const vertical = orientation === "vertical";

        let xScale, yScale;
        
        if(dateHistogram){

            // Handle the case of a vertical date histogram.
            xScale = d3.scaleTime();
            yScale = d3.scaleLinear();

        } else {

            // Handle the case of a vertical or horizontal bar chart.
            xScale = vertical ? d3.scaleBand() : d3.scaleLinear();
            yScale = vertical ? d3.scaleLinear() : d3.scaleBand();

        }

        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;

        xScale.range([0, innerWidth]);
        yScale.range([innerHeight, 0]);

        if(vertical){
            xScale.domain(data.map(function (d){ return d[xColumn]; }));
            yScale.domain([0, d3.max(data, function (d){ return d[yColumn] })]);
        } else {
            xScale.domain([0, d3.max(data, function (d){ return d[xColumn] })]);
            yScale.domain(data.map(function (d){ return d[yColumn]; }));
        }

        if(xScale.padding){ xScale.padding(padding); }
        if(yScale.padding){ yScale.padding(padding); }

        const xAxis = d3.axisBottom(xScale)
          .tickSizeInner(xTickGrid ? -innerHeight : xTickSizeInner)
          .tickSizeOuter(xTickSizeOuter);

        const yAxis = d3.axisLeft(yScale)
          .tickSizeInner(yTickGrid ? -innerWidth : yTickSizeInner)
          .tickSizeOuter(yTickSizeOuter);

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
                            vertical ? (
                                <rect
                                    key={ i }
                                    x={ xScale(d[xColumn]) }
                                    y={ yScale(d[yColumn]) }
                                    width={ xScale.bandwidth() }
                                    height={ innerHeight - yScale(d[yColumn]) }
                                />
                            ) : (
                                <rect
                                    key={ i }
                                    x={ 0 }
                                    y={ yScale(d[yColumn]) }
                                    width={ xScale(d[xColumn]) }
                                    height={ yScale.bandwidth() }
                                />
                            )
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
