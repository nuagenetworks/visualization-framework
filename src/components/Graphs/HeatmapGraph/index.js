import React from "react";
import XYGraph from "../XYGraph";

import {
    axisBottom,
    axisLeft,
    extent,
    format,
    nest,
    scaleBand,
    scaleTime,
    select,
    map,
    min
} from "d3";

import {properties} from "./default.config"
import { nest as dataNest } from "../../../utils/helpers"

export default class HeatmapGraph extends XYGraph {

    constructor(props) {
        super(props, properties);
    }

    render() {
        const {
            data: cdata,
            width,
            height,
            onMarkClick
        } = this.props;

        if (!cdata || !cdata.length)
            return;

        const {
            chartHeightToPixel,
            chartWidthToPixel,
            circleToPixel,
            colorColumn,
            colors,
            legend,
            margin,
            stroke,
            xColumn,
            xLabel,
            xTickFormat,
            xTickGrid,
            xTickSizeInner,
            xTickSizeOuter,
            yColumn,
            yTickFormat,
            yTickGrid,
            yTicks,
            yTickSizeInner,
            yTickSizeOuter,
            legendColumn,
            yAxisPadding,
            emptyBoxColor
        } = this.getConfiguredProperties();

        let nestedXData = dataNest({
            data: cdata,
            key: xColumn,
            sortColumn: xColumn
        })

        let nestedYData = dataNest({
            data: cdata,
            key: yColumn,
            sortColumn: yColumn
        })

        let data = []

        // Check x column data, if not found set to null
        nestedYData.forEach(item => {

            if(!item.key || typeof item.key === 'object')
                return

            let d = Object.assign({}, item)

            // Inserting new object if data not found
            nestedXData.forEach(list => {
                if(!list.key || typeof list.key === 'object')
                    return

                let index = (d.values).findIndex(o => {
                   return `${o[xColumn]}` === `${list.key}`
                })

                if(index !== -1
                    && d.values[index][yColumn] !== ""
                    && typeof d.values[index][yColumn] !== 'undefined'
                    && typeof d.values[index][yColumn] !== 'object'
                ) {
                    data.push(d.values[index])
                } else {
                    data.push({
                            [yColumn]: d.key,
                            [legendColumn]: 'Empty',
                            [xColumn]: parseInt(list.key)
                        })
                }
            })
        })

        if (!data || !data.length)
            return;

        const isVerticalLegend = legend.orientation === 'vertical';
        const xLabelFn         = (d) => d[xColumn];
        const yLabelFn         = (d) => d[yColumn];
        const legendFn         = (d) => d[legendColumn];
        const label            = (d) => d["key"];
        const scale            = this.getMappedScaleColor(data, legendColumn);
        const getColor         = (d) => {
            let value = null;
            if(d.hasOwnProperty(legendColumn)) {
                value = d[legendColumn]
            } else if(d.hasOwnProperty(colorColumn)) {
                value = d[colorColumn]
            } else if (d.hasOwnProperty("key")) {
                value = d["key"]
            }

            if(value === 'Empty') {
                return emptyBoxColor
            }

            return scale ? scale(value) : stroke.color || colors[0];
        }
        const cellColumnsData  = nest()
            .key((d) => legendColumn ? d[legendColumn] : "Cell")
            .entries(data);

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;
        let legendWidth       = legend.show && cellColumnsData.length ? this.longestLabelLength(data, legendFn) * chartWidthToPixel : 0;

        let yLabelWidth       = this.longestLabelLength(data, yLabelFn) * chartWidthToPixel;

        let leftMargin        = margin.left + yLabelWidth + yAxisPadding * chartWidthToPixel;

        let availableWidth    = width - (margin.left + margin.right + yLabelWidth - yAxisPadding * chartWidthToPixel);
        let availableHeight   = height - (margin.top + margin.bottom + chartHeightToPixel + xAxisHeight);

        if (legend.show) {
            legend.width = legendWidth;

            // Compute the available space considering a legend
            if (isVerticalLegend)
            {
                leftMargin      +=  legend.width;
                availableWidth  -=  legend.width;
            }
            else
            {
                const nbElementsPerLine  = parseInt(availableWidth / legend.width, 10);
                const nbLines            = parseInt(cellColumnsData.length / nbElementsPerLine, 10);

                availableHeight         -= nbLines * legend.circleSize * circleToPixel + chartHeightToPixel;
            }
        }

        //For Making xAxis BANDSCALE

        const distXDatas = map(data, xLabelFn).keys().sort();
        const distYDatas = map(data, yLabelFn).keys().sort();

        const xBandScale = scaleBand()
            .domain(distXDatas);
        xBandScale.rangeRound([0, availableWidth]).padding(0);

        const yBandScale = scaleBand()
            .domain(distYDatas);
        yBandScale.rangeRound([0, availableHeight]);

        let xValues = extent(data, xLabelFn);
        const xPadding = distXDatas.length > 1 ? ((xValues[1] - xValues[0]) / (distXDatas.length - 1)) / 2 : 1;

        let boxSize = min([xBandScale.bandwidth(), yBandScale.bandwidth()]) * 0.9;

        availableHeight = boxSize * distYDatas.length;
        availableWidth  = boxSize * distXDatas.length;

        const xScale = scaleTime()
            .domain([xValues[0] - xPadding, xValues[1] + xPadding]);

        const yScale = scaleBand()
            .domain(distYDatas);

        xScale.range([0, availableWidth]);
        yScale.rangeRound([availableHeight, 0]);

        const xAxis = axisBottom(xScale)
            .tickSizeInner(xTickGrid ? -availableHeight : xTickSizeInner)
            .tickSizeOuter(xTickSizeOuter);

        if(xTickFormat){
            xAxis.tickFormat(format(xTickFormat));
        }

        xAxis.tickValues(distXDatas);

        const yAxis = axisLeft(yScale)
            .tickSizeInner(yTickGrid ? -availableWidth : yTickSizeInner)
            .tickSizeOuter(yTickSizeOuter);

        if(yTickFormat){
            yAxis.tickFormat(format(yTickFormat));
        }

        if(yTicks){
            yAxis.ticks(yTicks);
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
        return (
            <div className="bar-graph">
                {this.tooltip}
                <svg width={width} height={height}>
                    {this.axisTitles(xTitlePosition, yTitlePosition)}
                    <g transform={ `translate(${leftMargin},${margin.top})` } >
                        <g
                            key="xAxis"
                            ref={ (el) => select(el)
                                    .call(xAxis)
                                    .selectAll("text")
                                    .attr("dy", "1em")
                                    .style("text-anchor", "end")
                                    .attr("transform", function(d) {
                                        return "rotate(-35)"
                                    })
                                }
                            transform={ `translate(0,${availableHeight})` }
                        />
                        <g
                            key="yAxis"
                            ref={ (el) => select(el).call(yAxis) }
                        />
                        {data.map((d, i) => {
                            // Compute rectangle depending on orientation (vertical or horizontal).
                            const {
                                x,
                                y,
                                width,
                                height
                            } = (
                                {
                                    x: xScale(d[xColumn]) - boxSize / 2,
                                    y: yScale(d[yColumn]) + yScale.bandwidth() / 2 - boxSize / 2,
                                    width: boxSize,
                                    height: boxSize
                                }
                            );

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
                                <g
                                    { ...this.tooltipProps(d) }
                                    data-effect="solid"
                                    key={ i }
                                >
                                    <rect
                                        x={ x }
                                        y={ y }
                                        onClick={ onClick }
                                        style={ style }
                                        width={ width }
                                        height={ height }
                                        fill={ getColor(d) }
                                        key={ i }
                                        opacity={ this.getOpacity(d) }
                                        stroke={ stroke.color }
                                        strokeWidth={ stroke.width }
                                        { ...this.tooltipProps(d) }
                                    />
                                </g>
                            );
                        })}
                    </g>
                    {this.renderLegend(cellColumnsData, legend, getColor, label)}
                </svg>
            </div>
        );
    }
}

HeatmapGraph.propTypes = {
    configuration: React.PropTypes.object,
    response: React.PropTypes.object
};
