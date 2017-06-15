import React from "react";
import XYGraph from "../XYGraph";
import { connect } from "react-redux";

import {
    axisBottom,
    axisLeft,
    extent,
    format,
    line,
    scaleLinear,
    scaleTime,
    select,
    brushX,
    voronoi,
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
            data,
            width,
            height
        } = this.props;

        if (!data || !data.length)
            return;

        const {
          chartHeightToPixel,
          chartWidthToPixel,
          circleToPixel,
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
          zeroStart
        } = this.getConfiguredProperties();

        let finalYColumn = typeof yColumn === 'object' ? yColumn : [yColumn];

        let updatedLinesLabel = [];
        if(linesColumn) {
            updatedLinesLabel = typeof linesColumn === 'object' ? linesColumn : [linesColumn];
        }

        let legendsData = finalYColumn.map((d, i) => {
            return {
                'key'   : d,
                'value' : updatedLinesLabel[i] ? updatedLinesLabel[i] : d
            };
        });

        let filterDatas = [];
        data.forEach((d) => {
            legendsData.forEach((ld) => {
                filterDatas.push(Object.assign({
                    yColumn: d[ld['key']],
                    columnType: ld['key']
                }, d));
            });
        });

        const isVerticalLegend = legend.orientation === 'vertical';

        const xLabelFn             = (d) => d[xColumn];

        const yLabelUnformattedFn  = (d) => d['yColumn'];

        const yLabelFn         = (d) => {
            if(!yTickFormat) {
                return d['yColumn'];
            }
            const formatter = format(yTickFormat);
            return formatter(d['yColumn']);
        };

        const legendFn         = (d) => d['value'];
        const label            = (d) => d['value'];
        const scale            = this.scaleColor(legendsData, 'key');
        const getColor         = (d) => scale ? scale(d['key']) : stroke.color || colors[0];

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;
        let legendWidth       = legend.show && legendsData.length >= 1 ? this.longestLabelLength(legendsData, legendFn) * chartWidthToPixel : 0;

        let yLabelWidth       = this.longestLabelLength(filterDatas, yLabelFn) * chartWidthToPixel;

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
                const nbLines            = parseInt(legendsData.length / nbElementsPerLine, 10);
                availableHeight         -= nbLines * legend.circleSize * circleToPixel + chartHeightToPixel;
            }
        }


        let yExtent = extent(filterDatas, yLabelUnformattedFn)

        if(zeroStart && yExtent[0] > 0) {
          yExtent[0] = 0;
        }

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

        const lineGenerator = function(data, column) {
            var generator = line()
                .x(function(d) { return xScale(d[xColumn]); })
                .y(function(d) { return yScale(d[column]); });

            return generator(data);
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
            .y(function(d) { return yScale(d['yColumn']); })
            .extent([[-leftMargin, -margin.top], [width + margin.right, height + margin.bottom]])
            .polygons(filterDatas);

        const tooltipOffset = (d) => JSON.stringify({
            'bottom': margin.top + yScale(d['yColumn']),
            'right': xScale(d[xColumn]) + leftMargin
        });

        return (
            <div className="bar-graph">
                {
                    this.tooltip
                }
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
                            {
                                legendsData.map((d, i) =>
                                    <path
                                        fill="none"
                                        stroke={ getColor(d) }
                                        strokeWidth={ stroke.width }
                                        d={ lineGenerator(data, d['key']) }
                                    />
                                )
                            }
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
                                      fill="none"
                                      d={ d == null ? null : "M" + d.join("L") + "Z" }
                                      style={{"pointer-events": "all"}}
                                  />
                              </g>
                          )}
                        </g>
                        {
                            brushEnabled &&
                            <g
                                key="brush"
                                ref={ (el) => select(el).call(this.brush) }
                            />
                        }
                    </g>
                    {this.renderLegend(legendsData, legend, getColor, label)}
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
