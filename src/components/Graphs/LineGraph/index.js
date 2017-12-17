import React from "react";
import XYGraph from "../XYGraph";
import { connect } from "react-redux";
import { nest } from "../../../utils/helpers"


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
    merge,
    event
} from "d3";

import {properties} from "./default.config";

class LineGraph extends XYGraph {

    yKey   = 'columnType'
    yValue = 'yColumn'

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
          defaultYColor,
          showNull
        } = this.getConfiguredProperties();


        let finalYColumn = typeof yColumn === 'object' ? yColumn : [yColumn];

        let updatedLinesLabel = [];
        if(linesColumn) {
            updatedLinesLabel = typeof linesColumn === 'object' ? linesColumn : [linesColumn];
        }

        let legendsData = updatedLinesLabel.map((d, i) => {
            return {
                'key'   : d,
                'value' : finalYColumn[i] ? finalYColumn[i] : d
            };
        });


        let filterDatas = []
        data.forEach((d) => {
            if(dateHistogram && d[xColumn] <= Date.now()) {
                legendsData.forEach((ld) => {
                    let key = typeof linesColumn === 'object' ? ld['key'] : d[ld['key']]

                    if(typeof key === "object" || key === "") {
                        return
                    }

                    filterDatas.push(Object.assign({
                        [this.yValue]: d[ld['value']],
                        [this.yKey]: key
                    }, d));
                });
            }
        });

        // Nesting data on the basis of yAxis
        let nestLinesData = nest({
            data: filterDatas,
            key: this.yKey
        })

        // Nesting data on the basis of xAxis (timestamp)
        let nestedXData = nest({
            data: filterDatas,
            key: xColumn,
            sortColumn: xColumn
        })

        let linesData = []
        // Check x column data, if not found either skip or set to 0 (if showNull is true)
        nestLinesData.forEach(item => {

            let d = Object.assign({}, item)
            let counter = 0
            let elem = null

            elem = {
                key: `${item.key}${counter}`,
                values: []
            }
            // Inserting new object if data not found
            nestedXData.forEach(list => {
                let index = (d.values).findIndex(o => {
                   return o[xColumn] == list.key
                })

                if(index !== -1
                    && d.values[index][this.yValue] !== ""
                    && typeof d.values[index][this.yValue] !== 'undefined'
                    && typeof d.values[index][this.yValue] !== 'object'
                ) {
                    elem.values.push(d.values[index])
                } else {
                    // If showNull is true, insert new object with yValue=0
                    if(showNull !== false) {
                        elem.values.push({
                            [this.yValue]: 0,
                            [this.yKey]: d.key,
                            [xColumn]: list.key
                        })
                    } else {
                        // Make new truncated line if yValue is null
                        if(elem.values.length) {
                            linesData.push(elem)
                            counter++;
                            elem = {
                                key: `${item.key}${counter}`,
                                values: []
                            }
                        }
                    }
                }
            })

            if(elem.values.length) {
                linesData.push(elem)
            }
        })

        const isVerticalLegend = legend.orientation === 'vertical';
        const xLabelFn         = (d) => d[xColumn];
        const yLabelFn         = (d) => d[this.yValue];
        const legendFn         = (d) => d[this.yKey];
        const label            = (d) => d[this.yKey];

        const scale            = this.scaleColor(filterDatas, this.yKey);
        const getColor         = (d) => scale ? scale(d[this.yKey] || d["key"]) : stroke.color || colors[0];

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;
        let legendWidth       = legend.show && linesData.length > 1 ? this.longestLabelLength(filterDatas, legendFn) * chartWidthToPixel : 0;

        let yLabelWidth       = this.longestLabelLength(filterDatas, yLabelFn, yTickFormat) * chartWidthToPixel;
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

        let yExtent = this.updateYExtent(extent(filterDatas, yLabelFn), zeroStart);

        let xScale;

        if (dateHistogram) {
            xScale = scaleTime()
              .domain(extent(filterDatas, xLabelFn));
        } else {
            xScale = scaleLinear()
              .domain(extent(filterDatas, xLabelFn));
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
          .x( d => xScale(d[xColumn]))
          .y( d => yScale(d[this.yValue]))

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
            .x( d => xScale(d[xColumn]))
            .y( d => yScale(d[this.yValue]))
            .extent([[-leftMargin, -margin.top], [width + margin.right, height + margin.bottom]])
            .polygons(merge(linesData.map(function(d) { return d.values; })));

        const tooltipOffset = (d) => JSON.stringify({
          'bottom': margin.top + yScale(d[this.yValue]),
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
                          {linesData.map((d, i) =>
                              (d.values.length === 1) ?
                                  <circle key={d.key} cx={xScale(d.values[0][xColumn])} cy={yScale(d.values[0][this.yValue])} r={circleRadius} fill={colors[0]} />
                              :
                              <path
                                  key={ d.key }
                                  fill="none"
                                  stroke={ getColor(d.values[0] || d) }
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
                    {this.renderLegend(filterDatas, legend, getColor, label)}
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
