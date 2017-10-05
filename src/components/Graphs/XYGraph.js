import React from "react";
import AbstractGraph from "./AbstractGraph";

import {
    format,
    scaleTime,
    extent,
    scaleLinear,
    axisBottom,
    axisLeft,
    scaleBand,
    map
} from "d3";

export default class XYGraph extends AbstractGraph {

    constructor(props, properties = {}) {
        super(props, properties);
    }

    writeYLabel(x, y) {

    }

    writeXLabel(x, y) {

    }

    setYBandScale(data) {

      const yLabelFn = (d) => d['yColumn'];

      const distYDatas = map(data, yLabelFn).keys().sort();

      this.yBandScale = scaleBand()
            .domain(distYDatas);
        this.yBandScale.rangeRound([0, this.getAvailableHeight()]);
    }

    getYBandScale() {
      return this.yBandScale;
    }

    setXBandScale(data) {
        const {
          xColumn
        } = this.getConfiguredProperties();

        const xLabelFn  = (d) => d[xColumn];

        const distXDatas = map(data, xLabelFn).keys().sort();

        this.xBandScale = scaleBand()
            .domain(distXDatas);
        this.xBandScale.rangeRound([0, this.getAvailableWidth()]);
    }

    getXBandScale() {
      //return min([this.xBandScale.bandwidth(), this.yBandScale.bandwidth()]);
      return this.xBandScale;
    }

    setXScale(data) {

        if (!data || !data.length)
            return;

        const {
          dateHistogram,
          xColumn
        } = this.getConfiguredProperties();

        const xLabelFn = (d) => d[xColumn];

        this.xScale = null;

        if (dateHistogram) {
            this.xScale = scaleTime()
              .domain(extent(data, xLabelFn));
        } else {
            this.xScale = scaleLinear()
              .domain(extent(data, xLabelFn));
        }

        this.xScale.range([0, this.getAvailableWidth()]);
    }

    getXScale() {
        return this.xScale;
    }

    setXaxis(data) {

        if (!data || !data.length)
            return;

        const {
          xTickSizeInner,
          xTickSizeOuter,
          xTickFormat,
          xTickGrid,
          xTicks
        } = this.getConfiguredProperties();

        this.xAxis = axisBottom(this.getXScale())
        .tickSizeInner(xTickGrid ? -this.getAvailableHeight() : xTickSizeInner)
        .tickSizeOuter(xTickSizeOuter);

        if(xTickFormat){
            this.xAxis.tickFormat(format(xTickFormat));
        }

        if(xTicks){
            this.xAxis.ticks(xTicks);
        }
    }

    getXAxis() {
        return this.xAxis;
    }

    setYScale(data) {

        const {
          zeroStart,
        } = this.getConfiguredProperties();

        const yLabelFn  = (d) => d['yColumn'];

        let yExtent = this.updateYExtent(extent(data, yLabelFn), zeroStart);
        
        this.yScale = scaleLinear()
            .domain(yExtent);
        
        this.yScale.range([this.getAvailableHeight(), 0]);
    } 

    getYScale() {
        return this.yScale;
    }

    setYaxis() {

          const {
            yTickFormat,
            yTickGrid,
            yTicks,
            yTickSizeInner,
            yTickSizeOuter,
          } = this.getConfiguredProperties();

          this.yAxis = axisLeft(this.getYScale())
            .tickSizeInner(yTickGrid ? -this.getAvailableWidth() : yTickSizeInner)
            .tickSizeOuter(yTickSizeOuter);

          if(yTickFormat){
              this.yAxis.tickFormat(format(yTickFormat));
          }

          if(yTicks){
              this.yAxis.ticks(yTicks);
          }
    }

    getYAxis() {
        return this.yAxis;
    } 

    setXTitlePositions() {

      const {
          chartHeightToPixel,
          margin,
        } = this.getConfiguredProperties();

        this.xTitlePosition = {
              left: this.getLeftMargin() + this.getAvailableWidth() / 2,
              top: margin.top + this.getAvailableHeight() + chartHeightToPixel + this.getXAxisHeight()
        }
    }

    getXTitlePositions() {
        return this.xTitlePosition;
    }

    setYTitlePositions() {

      const {
          chartWidthToPixel,
          margin,
        } = this.getConfiguredProperties();

        this.yTitlePosition = {
            // We use chartWidthToPixel to compensate the rotation of the title
            left: margin.left + chartWidthToPixel + (this.checkIsVerticalLegend() ? this.getLegend().width : 0),
            top: margin.top + this.getAvailableHeight() / 2
        }
    }

    getYTitlePositions() {
        return this.yTitlePosition;
    }

    axisTitles(xLabelPosition, yLabelPosition) {

        const {
          xColumn,
          xLabel,
          xLabelSize,
          yColumn,
          yLabel,
          yLabelSize,
        } = this.getConfiguredProperties();

        return (
            <g>
                { xLabel ? (
                    <text
                        className="axis-label"
                        x={ xLabelPosition.left }
                        y={ xLabelPosition.top }
                        textAnchor="middle"
                        fontSize={xLabelSize + "px"}
                    >
                      { xLabel === true ? xColumn : xLabel}
                    </text>
                  ) : null
                }
                { yLabel ? (
                    <text
                        className="axis-label"
                        transform={[
                          "translate(",
                          yLabelPosition.left ,
                          ",",
                          yLabelPosition.top,
                          ") rotate(-90)"
                        ].join("")}
                        textAnchor="middle"
                        fontSize={yLabelSize + "px"}
                    >
                      { yLabel === true ? yColumn : yLabel}
                    </text>
                  ) : null
                }
            </g>
        );
    }

    newAxisTitles(xLabelPosition, yLabelPosition) {
        const {
            xColumn,
            xLabel,
            xLabelSize,
            yColumn,
            yLabel,
            yLabelSize,
        } = this.getConfiguredProperties();

        return (
            <g>
                { xLabel ? (
                    <text
                        className="axis-label"
                        x={ xLabelPosition.left }
                        y={ xLabelPosition.top }
                        textAnchor="middle"
                        fontSize={xLabelSize + "px"}
                    >
                        { xLabel === true ? xColumn : xLabel}
                    </text>
                    ) : null
                }
                { yLabel ? (
                    <text
                        className="axis-label"
                        transform={[
                            "translate(",
                            yLabelPosition.left ,
                            ",",
                            yLabelPosition.top,
                            ") rotate(-90)"
                        ].join("")}
                        textAnchor="middle"
                        fontSize={yLabelSize + "px"}
                    >
                        { yLabel === true ? yColumn : yLabel}
                    </text>
                    ) : null
                }
            </g>
        );
    }
}
XYGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.array
};
