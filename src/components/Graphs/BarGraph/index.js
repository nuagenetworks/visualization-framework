import React from "react";

import XYGraph from "../XYGraph";

import * as d3 from "d3";

import "./style.css";

import { properties } from "./default.config"

import { nest, nestStack, nestSum, limit } from "../../../utils/helpers"

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
}

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

export default class BarGraph extends XYGraph {

    constructor(props) {
        super(props, properties);
    }

    render() {

        const {
            data,
            width,
            height,
            onMarkClick
        } = this.props;
        

        if (!data || !data.length)
            return;

        const {
          chartHeightToPixel,
          chartWidthToPixel,
          circleToPixel,
          colorColumn,
          colors,
          dateHistogram,
          interval,
          legend,
          margin,
          orientation,
          padding,
          stroke,
          xColumn,
          xLabel,
          xTickFormat,
          xTickGrid,
          xTicks,
          xTickSizeInner,
          xTickSizeOuter,
          yColumn,
          yTickFormat,
          yTickGrid,
          yTicks,
          yTickSizeInner,
          yTickSizeOuter,
          otherOptions,
          stackColumn
        } = this.getConfiguredProperties();

        const vertical = orientation  === "vertical";

        let dimension, metric;

        if (vertical) {
          dimension = xColumn
          metric = yColumn
        } else {
          dimension = yColumn
          metric = xColumn
        }

        let stack = stackColumn || dimension

        let nestedData = nestStack({
            data: limit({
              data: nestSum({
                data: nest({
                    data, 
                    key: dimension,
                    sortColumn: stack
                }),
                stackColumn: metric
              }),
              limitOption: Object.assign ({
                fields: [
                  {
                    type: 'array',
                    name: 'values',
                    groups: [stack],
                    metrics: metric
                  }
                ]}
                , otherOptions || {}
              )
            }),
            stackColumn: metric
        })

        const isVerticalLegend = legend.orientation === 'vertical';

        const xLabelFn         = (d) => d[xColumn];
        const yLabelFn         = (d) => d[yColumn];

        const stackLabelFn     = (d) => d[stack];

        const metricFn         = (d) => d.total
        const dimensionFn      = (d) => d.key

        const scale            = this.scaleColor(data, stack);

        const getColor         = (d) => scale ? scale(d[colorColumn || stack]) : colors[0];

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;
        
        let xAxisLabelWidth   = this.longestLabelLength(data, xLabelFn, xTickFormat) * chartWidthToPixel;
        let yAxisLabelWidth   = this.longestLabelLength(data, yLabelFn, yTickFormat) * chartWidthToPixel;

        let overAllAvailableWidth = width - (margin.left + margin.right);
        let maxWidthPercentage = 0.20;
        let trucatedYAxisWidth = ((overAllAvailableWidth * maxWidthPercentage) < yAxisLabelWidth ? (overAllAvailableWidth * maxWidthPercentage) : yAxisLabelWidth);
        
        let leftMargin        = margin.left + trucatedYAxisWidth;
        let availableWidth    = overAllAvailableWidth - trucatedYAxisWidth;
        let availableHeight   = height - (margin.top + margin.bottom + chartHeightToPixel + xAxisHeight);

        let legendWidth = this.longestLabelLength(data, stackLabelFn) * chartWidthToPixel;
        
        if (legend.show)
        {
            legend.width = legendWidth

            // Compute the available space considering a legend
            if (isVerticalLegend)
            {
                leftMargin      +=  legend.width;
                availableWidth  -=  legend.width;
            }
            else {
                const nbElementsPerLine  = parseInt(availableWidth / legend.width, 10);
                const nbLines            = parseInt(data.length / nbElementsPerLine, 10);
                availableHeight         -= nbLines * legend.circleSize * circleToPixel + chartHeightToPixel;
            }
        }

        let xScale, yScale;

        if (dateHistogram) {

            // Handle the case of a vertical date histogram.
            xScale = d3.scaleTime()
              .domain(d3.extent(nestedData, dimensionFn))

            yScale = d3.scaleLinear()
              .domain([0, d3.max(nestedData, metricFn)])

        } else if (vertical) {

            // Handle the case of a vertical bar chart.
            xScale = d3.scaleBand()
              .domain(nestedData.map(dimensionFn))
              .padding(padding)

            yScale = d3.scaleLinear()
              .domain([0, d3.max(nestedData, metricFn)])

        } else {
            // Handle the case of a horizontal bar chart.
            xScale = d3.scaleLinear()
              .domain([0, d3.max(nestedData, metricFn)])
            
            yScale = d3.scaleBand()
              .domain(nestedData.map(dimensionFn))
              .padding(padding)
        }

        xScale.range([0, availableWidth]);
        yScale.range([availableHeight, 0]);

        const xAxis = d3.axisBottom(xScale)
          .tickSizeInner(xTickGrid ? -availableHeight : xTickSizeInner)
          .tickSizeOuter(xTickSizeOuter);

        if(xTickFormat) {
            xAxis.tickFormat(d3.format(xTickFormat))
        }

        if(xTicks){
            xAxis.ticks(xTicks);
        }

        const yAxis = d3.axisLeft(yScale)
          .tickSizeInner(yTickGrid ? -availableWidth : yTickSizeInner)
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

        let xTitlePosition = {
            left: leftMargin + availableWidth / 2,
            top: margin.top + availableHeight + chartHeightToPixel + xAxisHeight
        }
        let yTitlePosition = {
            // We use chartWidthToPixel to compensate the rotation of the title
            left: margin.left + chartWidthToPixel + (isVerticalLegend ? legend.width : 0),
            top: margin.top + availableHeight / 2
        }

        let xAxisGraph = <g
            key="xAxis"
            ref={ (el) => vertical 
                  ? d3.select(el).call(xAxis)
                      .selectAll(".tick text")
                      .call(this.wrapD3Text, barWidth) 
                  : d3.select(el).call(xAxis)
                      .selectAll(".tick text") 
                }
            transform={ `translate(0, ${availableHeight})` }
        />

        let yAxisGraph = <g
            key="yAxis"
            ref={ (el) => ( !vertical && !dateHistogram) 
                  ? d3.select(el).call(yAxis)
                      .selectAll(".tick text")
                      .call(this.wrapD3Text, yAxisLabelWidth) 
                  : d3.select(el).call(yAxis) 
                }
        />

        return (
            <div className="bar-graph">
                {this.tooltip}
                <svg
                    style={{
                        width: width,
                        height: height
                    }}
                    >
                    {this.axisTitles(xTitlePosition, yTitlePosition)}
                    <g transform={ `translate(${leftMargin},${margin.top})` } >
                        { xAxisGraph }
                        { yAxisGraph }
                        {
                            nestedData.map((nest, i) => {
                                return nest.values.map((d, i) => {
                                    // Compute rectangle depending on orientation (vertical or horizontal).

                                    const {
                                        x,
                                        y,
                                        width,
                                        height
                                    } = (
                                        vertical ? {
                                            x: xScale(nest.key),
                                            y: yScale(d.y1),
                                            width: barWidth,
                                            height: yScale(d.y0) - yScale(d.y1)
                                        } : {
                                            x: xScale(d.y0),
                                            y: yScale(nest.key),
                                            width: xScale(d.y1) - xScale(d.y0),
                                            height: yScale.bandwidth()
                                        }
                                    );


                                // Set up clicking and cursor style.
                                const { onClick, style } = (

                                    // If an "onMarkClick" handler is registered,
                                    onMarkClick && (!otherOptions || d[dimension] !== otherOptions.label) ? {

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
                                        fill={ getColor(d) }
                                        onClick={ onClick }
                                        style={ style }
                                        key={ i }
                                        stroke={ stroke.color }
                                        strokeWidth={ stroke.width }
                                        { ...this.tooltipProps(d) }
                                    />
                                )
                            })
                        })}
                    </g>
                    {this.renderLegend(data, legend, getColor, stackLabelFn)}
                </svg>
            </div>
        );
    }
}
BarGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.arrayOf(React.PropTypes.object),
};
