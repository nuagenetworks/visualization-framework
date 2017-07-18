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

export default class HeatmapGraph extends XYGraph {

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
            margin,
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
            legendColumn
        } = this.getConfiguredProperties();


        const isVerticalLegend = legend.orientation === 'vertical';
        const xLabelFn         = (d) => d[xColumn];
        const yLabelFn         = (d) => d[yColumn];
        const legendFn         = (d) => d[legendColumn];
        const label            = (d) => d["key"];
        const scale            = this.getMappedScaleColor(data, legendColumn);
        const getColor         = (d) => scale ? scale(d[colorColumn] || d[legendColumn] || d["key"]) : stroke.color || colors[0];

        const cellColumnsData  = nest()
            .key((d) => legendColumn ? d[legendColumn] : "Cell")
            .entries(data);

        let xAxisHeight       = xLabel ? chartHeightToPixel : 0;
        let legendWidth       = legend.show && cellColumnsData.length ? this.longestLabelLength(data, legendFn) * chartWidthToPixel : 0;

        let yLabelWidth       = this.longestLabelLength(data, yLabelFn) * chartWidthToPixel;

        let leftMargin        = margin.left + yLabelWidth;
        let availableWidth    = width - (margin.left + margin.right + yLabelWidth);
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

        const xBandScale = scaleBand()
            .domain(distXDatas);
        xBandScale.rangeRound([0, availableWidth]);

        let xValues = extent(data, xLabelFn);

        const xPadding = distXDatas.length > 1 ? (xValues[1] - xValues[0]) / ((distXDatas.length - 1) * 2) : 0;
        const xScale = scaleTime()
            .domain([xValues[0] - xPadding, xValues[1] + xPadding]);

        const yScale = scaleBand()
            .domain(map(data, yLabelFn).keys().sort());

        xScale.range([0, availableWidth], 0.1);
        yScale.rangeRound([availableHeight, 0]).padding(padding);

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

        let xTitlePosition = {
            left: leftMargin + availableWidth / 2,
            top: margin.top + availableHeight + chartHeightToPixel + xAxisHeight
        }

        let yTitlePosition = {
            // We use chartWidthToPixel to compensate the rotation of the title
            left: margin.left + chartWidthToPixel + (isVerticalLegend ? legend.width : 0),
            top: margin.top + availableHeight / 2
        }

        let boxSize = min([xBandScale.bandwidth(), yScale.bandwidth()])
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
                        {data.map((d, i) => {
                            // Compute rectangle depending on orientation (vertical or horizontal).
                            const {
                                x,
                                y,
                                width,
                                height
                            } = (
                                {
                                    x: xScale(d[xColumn]) - (xPadding ? boxSize / 2 : 0),
                                    y: yScale(d[yColumn]) + yScale.bandwidth() / 2 - boxSize / 2,
                                    width: boxSize,
                                    height: boxSize
                                }
                            );

                            return (
                                <g
                                    { ...this.tooltipProps(d) }
                                    data-effect="solid"
                                >
                                    <rect
                                        x={ x }
                                        y={ y }
                                        width={ width }
                                        height={ height }
                                        fill={ getColor(d) }
                                        key={ i }
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
