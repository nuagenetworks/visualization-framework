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

    configureAxis(data) {
        this.setBandScale(data);
        this.setScale(data);
        this.setAxis(data);
        this.setTitlePositions();
    }

    setBandScale(data) {
        const {
          xColumn
        } = this.getConfiguredProperties();

        this.bandScale  = {};
        const xLabelFn  = (d) => d[xColumn];
        const yLabelFn  = (d) => d['y0'];

        const distXDatas = map(data, xLabelFn).keys().sort();
        const distYDatas = map(data, yLabelFn).keys().sort();

        this.bandScale.x = scaleBand()
            .domain(distXDatas);

        this.bandScale.x.rangeRound([0, this.getAvailableWidth()]);

        this.bandScale.y = scaleBand()
          .domain(distYDatas);

        this.bandScale.y.rangeRound([0, this.getAvailableHeight()]);
    }

    getBandScale() {
      return this.bandScale;
    }

    setScale(data) {
        if (!data || !data.length)
            return;

        const {
          dateHistogram,
          xColumn,
          zeroStart
        } = this.getConfiguredProperties();

        const xLabelFn = (d) => d[xColumn];
        const yLabelFn = (d) => d['y0'];
        const yExtent  = this.updateYExtent(extent(data, yLabelFn), zeroStart);

        this.scale = {};

        if (dateHistogram) {
            this.scale.x = scaleTime()
              .domain(extent(data, xLabelFn));
        } else {
            this.scale.x = scaleLinear()
              .domain(extent(data, xLabelFn));
        }

        this.scale.x.range([0, this.getAvailableWidth()]);

        this.scale.y = scaleLinear()
            .domain(yExtent);
        
        this.scale.y.range([this.getAvailableHeight(), 0]);
    }

    getScale() {
        return this.scale;
    }

    setAxis(data) {

        if (!data || !data.length)
            return;

        const {
            xTickSizeInner,
            xTickSizeOuter,
            xTickFormat,
            xTickGrid,
            xTicks,
            yTickFormat,
            yTickGrid,
            yTicks,
            yTickSizeInner,
            yTickSizeOuter,
        } = this.getConfiguredProperties();

        this.axis = {};

        // X axis
        this.axis.x = axisBottom(this.getScale().x)
            .tickSizeInner(xTickGrid ? -this.getAvailableHeight() : xTickSizeInner)
            .tickSizeOuter(xTickSizeOuter);

        if(xTickFormat){
            this.axis.x.tickFormat(format(xTickFormat));
        }

        if(xTicks){
            this.axis.x.ticks(xTicks);
        }
        
        // Y axis
        this.axis.y = axisLeft(this.getScale().y)
            .tickSizeInner(yTickGrid ? -this.getAvailableWidth() : yTickSizeInner)
            .tickSizeOuter(0);

        if(yTickFormat){
            this.axis.y.tickFormat(format(yTickFormat));
        }

        if(yTicks){
            this.axis.y.ticks(yTicks);
        }
    }

    getAxis() {
        return this.axis;
    }

    setTitlePositions() {
      const {
          chartHeightToPixel,
          chartWidthToPixel,
          margin,
        } = this.getConfiguredProperties();

        this.titlePosition = {
            x: {
              left: this.getLeftMargin() + this.getAvailableWidth() / 2,
              top: margin.top + this.getAvailableHeight() + chartHeightToPixel + this.getXAxisHeight()
            },
            y: {
              left: margin.left + chartWidthToPixel + (this.checkIsVerticalLegend() ? this.getLegendConfig().width : 0),
              top: margin.top + this.getAvailableHeight() / 2
            }
        }
    }

    getTitlePositions() {
        return this.titlePosition;
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

    generateAxisTitleElement() {

        const {
            xLabel,
            yLabel
        } = this.getConfiguredProperties();

        const axis = this.getSVG().select('.axis-title');

        if(xLabel) {
            axis.append('text')
            .attr('class', 'x-axis-label')
            .attr('text-anchor', 'middle');
        }

        if(yLabel) {
            axis.append('text')
              .attr('class', 'y-axis-label')
              .attr('text-anchor', 'middle')
        }


    }

    setAxisTitles() {
        const {
            xColumn,
            xLabel,
            xLabelSize,
            yColumn,
            yLabel
        } = this.getConfiguredProperties();

        const tilePositions = this.getTitlePositions();

        const axis = this.getSVG().select('.axis-title');

        if(xLabel) {
            axis.select('.x-axis-label')
              .attr('x', tilePositions.x.left)
              .attr('y', tilePositions.x.top)
              .style('font-size', `${xLabelSize}px` )
              .text(xLabel === true ? xColumn : xLabel)
        }

        if(yLabel) {
            axis.select('.y-axis-label')
              .attr('font-size', `${xLabelSize}px` )
              .attr('transform', `translate(${tilePositions.y.left}, ${tilePositions.y.top}) rotate(-90)`)
              .text(yLabel === true ? yColumn : yLabel)
        }
    }
}

XYGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.array
};
