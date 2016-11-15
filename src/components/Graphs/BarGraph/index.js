import React from "react";

import AbstractGraph from "../AbstractGraph";

import * as d3 from "d3";

import "./style.css";

// TODO split out this time interval log into a utility module.

// Time unit abbreviations from
// https://www.elastic.co/guide/en/elasticsearch/reference/current/common-options.html#time-units
// mapping onto D3 time intervals defined ad
// https://github.com/d3/d3-time#intervals
const timeAbbreviations = {
    "y": "utcYear",
    "M": "utcMonth",
    "w": "utcWeek",
    "d": "utcDay",
    "h": "utcHour",
    "m": "utcMinute",
    "s": "utcSecond",
    "ms": "utcMillisecond"
};

function computeBarWidth(interval, timeScale) {
    const step = +interval.substr(0, interval.length - 1);

    // TODO handle case of "ms"
    const abbreviation = interval.substr(interval.length - 1);
    const d3Interval = timeAbbreviations[abbreviation];

    // TODO validation and error handling
    const start = new Date(2000, 0, 0, 0, 0);
    const end = d3[d3Interval].offset(start, step);

    return timeScale(end) - timeScale(start);
}


export default class BarGraph extends AbstractGraph {

    render() {

        const { data, width, height, onMarkClick } = this.props;

        if (!data || !data.length)
            return;

        const {
          xColumn,
          yColumn,
          margin: { top, bottom, left, right },
          padding,
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
          xLabel,
          xLabelOffset,
          xLabelSize,
          orientation,
          dateHistogram,
          interval,
          stroke
        } = this.getConfiguredProperties();

        const vertical = orientation === "vertical";

        let xScale, yScale;

        if (dateHistogram) {

            // Handle the case of a vertical date histogram.
            xScale = d3.scaleTime()
              .domain(d3.extent(data, function (d){ return d[xColumn]; }));
            yScale = d3.scaleLinear()
              .domain([0, d3.max(data, function (d){ return d[yColumn] })]);

        } else if(vertical) {

            // Handle the case of a vertical bar chart.
            xScale = d3.scaleBand()
              .domain(data.map(function (d){ return d[xColumn]; }))
              .padding(padding);
            yScale = d3.scaleLinear()
              .domain([0, d3.max(data, function (d){ return d[yColumn] })]);

        } else {

            // Handle the case of a horizontal bar chart.
            xScale = d3.scaleLinear()
              .domain([0, d3.max(data, function (d){ return d[xColumn] })]);
            yScale = d3.scaleBand()
              .domain(data.map(function (d){ return d[yColumn]; }))
              .padding(padding);
        }

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

        let barWidth;

        if(dateHistogram){
            barWidth = computeBarWidth(interval, xScale);
        } else if(vertical){
            barWidth = xScale.bandwidth();
        }

        return (
            <div className="bar-graph">
                {this.tooltip}
                <svg width={width} height={height}>
                    { xLabel ? (
                        <text
                            className="axis-label"
                            x={ left + (innerWidth / 2) }
                            y={ height - xLabelOffset }
                            textAnchor="middle"
                            fontSize={xLabelSize + "px"}
                        >
                          { xLabel }
                        </text>
                      ) : null
                    }
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
                        {data.map((d, i) => {

                            // Compute rectangle depending on orientation (vertical or horizontal).
                            const { x, y, width, height } = (
                                vertical ? {
                                    x: xScale(d[xColumn]),
                                    y: yScale(d[yColumn]),
                                    width: barWidth,
                                    height: innerHeight - yScale(d[yColumn])
                                } : {
                                    x: 0,
                                    y: yScale(d[yColumn]),
                                    width: xScale(d[xColumn]),
                                    height: yScale.bandwidth()
                                }
                            );

                            // Compute the fill color based on the index.
                            const fill = this.applyColor(i);

                            // Set up clicking and cursor style.
                            const { onClick, style } = (

                                // If an "onMarkClick" handler is registered,
                                onMarkClick ? {

                                    // set it up to be invoked, passing the current data row object.
                                    onClick: () => onMarkClick(d),

                                    // Make the cursor a pointer on hover, as an affordance for clickability.
                                    style: { cursor: "pointer" }

                                } : {
                                    // Otherwise, set onClick and style to "undefined".
                                }
                            );

                            return (
                                <rect 
                                    x={ x }
                                    y={ y }
                                    width={ width }
                                    height={ height }
                                    fill={ fill }
                                    onClick={ onClick }
                                    style={ style }
                                    key={ i }
                                    stroke={ stroke.color }
                                    strokeWidth={ stroke.width }
                                    { ...this.tooltipProps(d) }
                                />
                            );
                        })}
                    </g>
                </svg>
            </div>
        );
    }
}
BarGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.object
};
