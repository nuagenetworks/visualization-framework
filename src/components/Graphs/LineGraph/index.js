import React from "react";
import XYGraph from "../XYGraph";
import { connect } from "react-redux";

import {
    axisBottom,
    axisLeft,
    extent,
    format,
    line,
    nest,
    scaleLinear,
    scaleTime,
    select,
    brushX,
    voronoi,
    merge,
    event
} from "d3";

import {properties} from "./default.config";

class LineGraph extends XYGraph {

    constructor(props) {
        super(props, properties);
        this.brush = brushX();
    }

    render() {

        const {
            data: originalData,
            width,
            height
        } = this.props;

        if (!originalData || !originalData.length)
            return;

        const {
          chartHeightToPixel,
          chartWidthToPixel,
          circleToPixel,
          colorColumn,
          colors,
          dateHistogram,
          legend,
          linesColumn,
          margin,
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
          brushEnabled,
          zeroStart,
          circleRadius,
          defaultY,
          defaultYColor
        } = this.getConfiguredProperties();

        const isVerticalLegend = legend.orientation === 'vertical';
        const xLabelFn         = (d) => d[xColumn];
        const yLabelFn         = (d) => d[yColumn];
        const legendFn         = (d) => d[linesColumn];
        const label            = (d) => d["key"];

        const data = originalData.map(d => {
          return Object.assign({}, d, yLabelFn(d) ? {} : {[yColumn]: 0});
        });

        const scale            = this.scaleColor(data, linesColumn);
        const getColor         = (d) => scale ? scale(d[colorColumn] || d[linesColumn] || d["key"]) : stroke.color || colors[0];

        const linesData = nest()
            .key((d) => linesColumn ? d[linesColumn] : "Line")
            .entries(data);

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;
        let legendWidth       = legend.show && linesData.length > 1 ? this.longestLabelLength(data, legendFn) * chartWidthToPixel : 0;

        let yLabelWidth       = this.longestLabelLength(data, yLabelFn, yTickFormat) * chartWidthToPixel;
        let leftMargin        = margin.left + yLabelWidth;
        let availableWidth    = width - (margin.left + margin.right + yLabelWidth);
        let availableHeight   = height - (margin.top + margin.bottom + chartHeightToPixel + xAxisHeight);



        if (legend.show)
        {
            legend.width = legendWidth;

            // Compute the available space considering a legend
            if (isVerticalLegend)
            {
                leftMargin      +=  legend.width;
                availableWidth  -=  legend.width;
            }
            else {
                const nbElementsPerLine  = parseInt(availableWidth / legend.width, 10);
                const nbLines            = parseInt(linesData.length / nbElementsPerLine, 10);
                availableHeight         -= nbLines * legend.circleSize * circleToPixel + chartHeightToPixel;
            }
        }

        let yExtent = this.updateYExtent(extent(data, yLabelFn), zeroStart);

        let xScale;

        if (dateHistogram) {
            xScale = scaleTime()
              .domain(extent(data, xLabelFn));
        } else {
            xScale = scaleLinear()
              .domain(extent(data, xLabelFn));
        }

        const yScale = scaleLinear()
          .domain(yExtent);

        xScale.range([0, availableWidth]);
        yScale.range([availableHeight, 0]);

        // calculate new range from defaultY
        let horizontalLine,
        defaultYvalue,
        horizontalLineData

        if(defaultY) {

            defaultYvalue = defaultY
            let [startRange, endRange] = yScale.domain()

            if(typeof defaultY === 'object' && defaultY.source && defaultY.column && this.props[defaultY.source]) {
                horizontalLineData = this.props[defaultY.source][0] || {}
                defaultYvalue = horizontalLineData[defaultY.column] || null
            }

            startRange = startRange > defaultYvalue ? defaultYvalue - 1 : startRange
            endRange = endRange < defaultYvalue ? defaultYvalue + 1 : endRange
            yScale.domain([startRange, endRange]);

        }

        const xAxis = axisBottom(xScale)
          .tickSizeInner(xTickGrid ? -availableHeight : xTickSizeInner)
          .tickSizeOuter(xTickSizeOuter);

        if(xTickFormat){
            xAxis.tickFormat(format(xTickFormat));
        }

        if(xTicks){
            xAxis.ticks(xTicks);
        }

        const yAxis = axisLeft(yScale)
          .tickSizeInner(yTickGrid ? -availableWidth : yTickSizeInner)
          .tickSizeOuter(yTickSizeOuter);

        if(yTickFormat){
            yAxis.tickFormat(format(yTickFormat));
        }

        if(yTicks){
            yAxis.ticks(yTicks);
        }

        const lineGenerator = line()
          .x(function(d) { return xScale(d[xColumn]); })
          .y(function(d) { return yScale(d[yColumn]); });

        let xTitlePosition = {
            left: leftMargin + availableWidth / 2,
            top: margin.top + availableHeight + chartHeightToPixel + xAxisHeight
        }
        let yTitlePosition = {
            // We use chartWidthToPixel to compensate the rotation of the title
            left: margin.left + chartWidthToPixel + (isVerticalLegend ? legend.width : 0),
            top: margin.top + availableHeight / 2
        }

        if(brushEnabled){
            this.brush
                .extent([[0, 0], [availableWidth, availableHeight]])
                .on("end", () => {
                    // If there is a brushed region...
                    if(event.selection){
                        const [startTime, endTime] = event.selection
                          .map(xScale.invert, xScale) // Convert from pixel coords to Date objects.
                          .map((date) => date.getTime()); // Convert from Date to epoch milliseconds.
                        const queryParams = Object.assign({}, this.props.context, { startTime, endTime });
                        this.props.goTo(window.location.pathname, queryParams);
                    }
                });
        }

        const tooltipOverlay = voronoi()
            .x(function(d) { return xScale(d[xColumn]); })
            .y(function(d) { return yScale(d[yColumn]); })
            .extent([[-leftMargin, -margin.top], [width + margin.right, height + margin.bottom]])
            .polygons(merge(linesData.map(function(d) { return d.values; })));

        const tooltipOffset = (d) => JSON.stringify({
          'bottom': margin.top + yScale(d[yColumn]),
          'right': xScale(d[xColumn]) + leftMargin
        });

        //draw horizontal line
        if(defaultYvalue) {
            let y = yScale(defaultYvalue),
            height = 20,
            tooltip = []

            if(horizontalLineData && defaultY.tooltip) {
                tooltip = this.tooltipProps(Object.assign({}, horizontalLineData ,{tooltipName: 'defaultY'}))
            }

            horizontalLine = (
                <g>
                    <rect
                        height={height}
                        width={availableWidth}
                        x="0"
                        y={ y - height/2}
                        opacity="0"
                        { ...tooltip }
                        data-offset="{ 'left' : 0, 'bottom' : 0}"
                    />
                    <line
                        x1="0"
                        y1={y}
                        x2={availableWidth}
                        y2={y}
                        stroke={ defaultYColor ? defaultYColor : "rgb(255,0,0)"}
                        strokeWidth="1.5"
                        opacity="0.7"
                        className="horizontalLine"
                    />
                </g>
            )
        }

        return (
            <div className="bar-graph">
                {this.tooltip}
                <svg width={width} height={height}>
                    {this.axisTitles(xTitlePosition, yTitlePosition)}
                    <g transform={ `translate(${leftMargin},${margin.top})` } >
                        <g
                            key="xAxis"
                            ref={ (el) => select(el).call(xAxis) }
                            transform={ `translate(0,${availableHeight})` }
                        />
                        <g
                            key="yAxis"
                            ref={ (el) => select(el).call(yAxis) }
                        />
                        <g>
                          {linesData.map((d) =>

                              (d.values.length === 1) ?
                                  <circle cx={xScale(d.values[0][xColumn])} cy={yScale(d.values[0][yColumn])} r={circleRadius} fill={colors[0]} />
                              :
                              <path
                                  key={ d.key }
                                  fill="none"
                                  stroke={ getColor(d) }
                                  strokeWidth={ stroke.width }
                                  d={ lineGenerator(d.values) }
                              />
                          )}
                        </g>
                        <g>
                          {tooltipOverlay.map((d, i) =>
                              <g
                                  key={ i }
                                  { ...this.tooltipProps(d.data) }
                                  data-offset={tooltipOffset(d.data)}
                                  data-effect="solid"
                              >

                                  /*
                                    This rectangle is a hack
                                    to position tooltips correctly.
                                    Due to this rectangle, the boundingClientRect
                                    used by ReactTooltip for positioning the tooltips
                                    has an upper left corner at (0, 0).
                                  */
                                  <rect
                                      x={-leftMargin}
                                      y={-margin.top}
                                      width="1"
                                      height="1"
                                      fill="none"
                                  />

                                  <path
                                      key={ i }
                                      fill="none"
                                      d={ d == null ? null : "M" + d.join("L") + "Z" }
                                      style={{"pointerEvents": "all"}}
                                  />
                              </g>
                          )}
                        </g>
                        { horizontalLine }
                        {
                            brushEnabled &&
                            <g
                                key="brush"
                                ref={ (el) => select(el).call(this.brush) }
                            />
                        }
                    </g>
                    {this.renderLegend(linesData, legend, getColor, label)}
                </svg>
            </div>
        );
    }
}
LineGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};

const actionCreators = (dispatch) => ({
});

export default connect(null, actionCreators)(LineGraph);
