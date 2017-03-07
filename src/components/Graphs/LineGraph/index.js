import React from "react";
import XYGraph from "../XYGraph";

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
    voronoi,
    merge
} from "d3";

import {properties} from "./default.config"

export default class LineGraph extends XYGraph {

    constructor(props) {
        super(props, properties);
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
          colorColumn,
          colors,
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
          yTickSizeOuter
        } = this.getConfiguredProperties();

        const isVerticalLegend = legend.orientation === 'vertical';
        const xLabelFn         = (d) => d[xColumn];
        const yLabelFn         = (d) => d[yColumn];
        const legendFn         = (d) => d[linesColumn];
        const label            = (d) => d["key"];
        const scale            = this.scaleColor(data, linesColumn);
        const getColor         = (d) => scale ? scale(d[colorColumn] || d[linesColumn] || d["key"]) : stroke.color || colors[0];

        const linesData = nest()
            .key((d) => linesColumn ? d[linesColumn] : "Line")
            .entries(data);

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;
        let legendWidth       = legend.show && linesData.length > 1 ? this.longestLabelLength(data, legendFn) * chartWidthToPixel : 0;
        let xLabelWidth       = this.longestLabelLength(data, xLabelFn) * chartWidthToPixel;
        let yLabelWidth       = this.longestLabelLength(data, yLabelFn) * chartWidthToPixel;
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

        const xScale = scaleTime()
          .domain(extent(data, xLabelFn));
        const yScale = scaleLinear()
          .domain(extent(data, yLabelFn));

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

        const tooltipOverlay = voronoi()
            .x(function(d) { return xScale(d[xColumn]); })
            .y(function(d) { return yScale(d[yColumn]); })
            .extent([[-leftMargin, -margin.top], [width + margin.right, height + margin.bottom]])
            .polygons(merge(linesData.map(function(d) { return d.values; })));

        const tooltipOffset = (d) => JSON.stringify({
          'bottom': margin.top + yScale(d[yColumn]),
          'right': xScale(d[xColumn]) + leftMargin
        });

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
                          {tooltipOverlay.map((d) =>
                              <g
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
