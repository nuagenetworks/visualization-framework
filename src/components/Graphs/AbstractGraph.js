import React from "react";
import { scaleOrdinal } from "d3";
import ReactTooltip from "react-tooltip";
import evalExpression from "eval-expression"

import * as d3 from "d3";

import { GraphManager } from "./index";
import columnAccessor from "../../utils/columnAccessor";
import crossfilter from "crossfilter2";

import {
    format
} from "d3";


export default class AbstractGraph extends React.Component {

    constructor(props, properties = {}) {
        super(props);

        this.configuredProperties = {};
        this.node = {};

        this.yLabelWidth = 0;

        this.setGraphId();

        this.defaults = GraphManager.getDefaultProperties(properties);

        // set all configuration into single object
        this.setConfiguredProperties();

        // Provide tooltips for subclasses.
        const { tooltip } = this.getConfiguredProperties();
        if(tooltip) {

            this.setTooltipAccessor(tooltip);

            // Expose tooltipId in case subclasses need it.
            this.tooltipId = `tooltip-${this.getGraphId()}`;

            // This JSX object can be used by subclasses to enable tooltips.
            this.tooltip = (
                <ReactTooltip
                    id={ this.tooltipId }
                    place="top"
                    type="dark"
                    effect="float"
                    getContent={[() => this.getTooltipContent(this.hoveredDatum), 200]}
                    afterHide={() =>  this.handleHideEvent()}
                    afterShow={() =>  this.handleShowEvent()}
                />
            );

            // Subclasses can enable tooltips on their marks
            // by spreading over the return value from this function
            // when invoked with the mark's data element `d` like this:
            // data.map((d) => <rect { ...this.tooltipProps(d) } />
            this.tooltipProps = (d) => ({
                "data-tip": true,
                "data-for": this.tooltipId,
                "onMouseEnter": () => this.hoveredDatum = d,
                "onMouseMove": () => this.hoveredDatum = d
            });

        } else {
            this.getTooltipContent = () => null
            this.tooltipProps = () => null
        }
    }

    setTooltipAccessor(tooltip) {
        // Generate accessors that apply number and date formatters.
        const accessors = tooltip.map(columnAccessor);
        
        // This function is invoked to produce the content of a tooltip.
        this.getTooltipContent = (data) => {
            // The value of this.hoveredDatum should be set by subclasses
            // on mouseEnter and mouseMove of visual marks
            // to the data entry corresponding to the hovered mark.
            if(data) {
                return (
                    <div>
                        {/* Display each tooltip column as "label : value". */}
                        {tooltip.map(({column, label}, i) => (
                            <div key={column}>
                                <strong>
                                    {/* Use label if present, fall back to column name. */}
                                    {label || column}
                                </strong> : <span>
                                    {/* Apply number and date formatting to the value. */}
                                    {accessors[i](data)}
                                </span>
                            </div>
                        ))}
                    </div>
                );
            } else {
                return null;
            }
        }
    }

    setGraphId() {
        this.graphId = new Date().valueOf();
    }

    getGraphId () {
        return this.graphId;
    }

    getSVG() {
        return d3.select(this.node);
    }

    handleShowEvent() {}

    handleHideEvent() {}

    wrapD3Text (text, width) {
      text.each(function() {
        var text = d3.select(this),
          words = text.text().split(/\s+/).reverse(),
          word = words.pop(),
          line = [],
          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", -2).attr("y", y).attr("dy", dy + "em");

        while (word && tspan.node().getComputedTextLength() < width) {
          line.push(word);
          tspan.text(line.join(" "));
          word = words.pop();
        }

        if(word) {
          tspan.text(line.join(" ") + '...');
        }
      });
    };

    setConfiguredProperties() {
        this.configuredProperties = Object.assign({}, this.defaults, this.props.configuration.data);
    }

    getConfiguredProperties() {
        return this.configuredProperties;
    }

    getMappedScaleColor(data, defaultColumn) {
        const {
            colors,
            mapColors,
            colorColumn,
        } = this.getConfiguredProperties();

        if (!colorColumn && !defaultColumn)
            return;

        let domainData = d3.map(data, (d) => d[colorColumn || defaultColumn]).keys().sort();

        let propColors = [];
        domainData.forEach((d) => {
            if(mapColors[d]) {
                propColors.push(mapColors[d]);
            }
        })
        propColors = propColors.concat(colors);

        const scale = scaleOrdinal(propColors);
        scale.domain(domainData);

        return scale;
    }

    updateYExtent(yExtent, zeroStart) {
      let padding = 0.10;

      if(zeroStart && yExtent[0] > 0) {
        yExtent[0] = 0;
      }

      let diff = Math.floor((yExtent[1] - yExtent[0]) * padding, 0);

      yExtent[0] = (yExtent[0] >= 0 && (yExtent[0] - diff) < 0) ? 0 : yExtent[0] - diff;
      yExtent[1] = (yExtent[1] <= 0 && (yExtent[1] + diff) > 0) ? 0 : yExtent[1] + diff;

      return yExtent;
    }

    scaleColor(data, defaultColumn) {
        const {
            colors,
            colorColumn,
        } = this.getConfiguredProperties();

        if (!colorColumn && !defaultColumn)
            return;

        const scale = scaleOrdinal(colors);
        scale.domain(data.map((d) => d[colorColumn || defaultColumn]));

        return scale;
    }

    longestLabelLength(data, label, formatter) {
        // Basic function if none provided
        if (!label)
            label = (d) => d;

        let format = (d) => d;

        if (formatter)
            format = d3.format(formatter);


        // Extract the longest legend according to the label function
        const lab = label(data.reduce((a, b) => {
            let labelA = label(a);
            let labelB = label(b);

            if (!labelA)
                return b;

            if (!labelB)
                return a;

            return format(labelA.toString()).length > format(labelB.toString()).length ? a : b;
        }));

        const longestLabel = lab ? lab.toString() : '';

        // and return its length + 1 to ensure we have enough space
        return format(longestLabel).length + 1;
    }

    renderLegend(data, legend, getColor, label) {

        if (!legend.show)
            return;

        // Getting unique labels
        data = data.filter((e, i) => data.findIndex(a => label(a) === label(e)) === i)

        const {
            width,
            height
        } = this.props;

        const {
          margin,
          fontColor,
          circleToPixel,
        } = this.getConfiguredProperties();

        const isVertical = legend.orientation === 'vertical';
        const lineHeight = legend.circleSize * circleToPixel;

        if (isVertical)
        {
            // Place the legends in the bottom left corner
            let left = margin.left;
            let top  = height - (margin.bottom + ((data.length - 1) * lineHeight));

            return (
                <g>
                    {data.map((d, i) => {
                        const x = left;
                        const y = top + (i *  lineHeight);
                        return (
                            <g
                                key={i}
                                transform={ `translate(${x}, ${y})` }>

                                <circle
                                  r={ legend.circleSize }
                                  fill={ getColor(d) }
                                />

                                <text
                                  fill={ fontColor }
                                  alignmentBaseline="central"
                                  x={ legend.circleSize + legend.labelOffset }
                                >
                                    { label(d) }
                                </text>
                            </g>
                        );
                    })}
                </g>
            );
        }

        // Place legends horizontally
        const availableWidth    = width - margin.left - margin.right;
        const legendWidth       = legend.width + legend.circleSize + 2 * legend.labelOffset;
        const nbElementsPerLine = parseInt(availableWidth / legendWidth, 10);
        const nbLines           = parseInt(data.length / nbElementsPerLine, 10);
        const left              = margin.left;
        const top               = height - (margin.bottom + (nbLines * lineHeight));

        return (
            <g>
                {data.map((d, i) => {
                    const x = left + ((i % nbElementsPerLine) * legendWidth);
                    const y = top + parseInt(i / nbElementsPerLine, 10) * lineHeight;
                    return (
                        <g
                            key={i}
                            transform={ `translate(${x}, ${y})` }>

                            <circle
                              r={ legend.circleSize }
                              fill={ getColor(d) }
                            />

                            <text
                              fill={ fontColor }
                              alignmentBaseline="central"
                              x={ legend.circleSize + legend.labelOffset }
                            >
                                { label(d) }
                            </text>
                        </g>
                    );
                })}
            </g>
        );
    }

    setYlabelWidth(data, yColumn = null) {
        const {
          chartWidthToPixel,
          yTickFormat
        } = this.getConfiguredProperties();

        yColumn = yColumn ? yColumn : 'yColumn'
        const yLabelFn = (d) => {
            if(!yTickFormat) {
                return d[yColumn];
            }
            const formatter = format(yTickFormat);
            return formatter(d[yColumn]);
        };

        this.yLabelWidth = this.longestLabelLength(data, yLabelFn) * chartWidthToPixel;
    }

    getYlabelWidth() {
        return this.yLabelWidth;
    }

    setDimensions(props, data = null, yColumn) {
        
        this.setYlabelWidth(data ? data : props.data, yColumn);
        this.setAvailableWidth(props);
        this.setAvailableHeight(props);
        this.setLeftMargin();
    }
    
    setLeftMargin() {
      const {
          margin
        } = this.getConfiguredProperties();

        this.leftMargin   = margin.left + this.getYlabelWidth();
    }

    getLeftMargin() {
        return this.leftMargin;
    }
    
    setAvailableWidth({width}) {
        const {
          margin,
        } = this.getConfiguredProperties();

        this.availableWidth = width - (margin.left + margin.right + this.getYlabelWidth());
    }

    getAvailableWidth() {
       return this.availableWidth;
    }

    // height of x-axis
    getXAxisHeight() {
        const {
          chartHeightToPixel,
          xLabel
        } = this.getConfiguredProperties();

        return xLabel ? chartHeightToPixel : 0;
    }

    setAvailableHeight({height}) {

        const {
          chartHeightToPixel,
          margin
        } = this.getConfiguredProperties();

        this.availableHeight   = height - (margin.top + margin.bottom + chartHeightToPixel + this.getXAxisHeight());

    }

    getAvailableHeight() {
        return this.availableHeight;
    }

    // Check whether to display legend as vertical or horizontal
    checkIsVerticalLegend() {
        const {
          legend
        } = this.getConfiguredProperties();

        return legend.orientation === 'vertical';
    }
    
    getGroupedData(data, settings) {
        
        const {
          otherMinimumLimit
        } = this.getConfiguredProperties();

        if(settings.otherOptions && settings.otherOptions.limit) {

            let cfData = crossfilter(data);
            let metricDimension = cfData.dimension( d => d[settings.metric] );
            let limit = settings.otherOptions.limit;

            if(!settings.otherOptions.type || settings.otherOptions.type === "percentage") {
                const sortedData = metricDimension.top(Infinity);
                const total = sortedData.reduce((total, d) => +total + d[settings.metric], 0);

                let sum = 0;
                let index = sortedData.findIndex( (d, i) =>  {
                    sum += +d[settings.metric];
                    if(((sum / total) * 100) >= limit) {
                        return true;
                    }
                });

                limit = index !== -1 ? index + 1 : limit;

                /**
                  Limit must meet the minimum limit default to 10
                **/
                let min = settings.otherOptions.minimum ? settings.otherOptions.minimum : otherMinimumLimit;
                if( limit < min)
                  limit = min;
            }


            let topData = metricDimension.top(limit);
            const otherDatas = metricDimension.top(Infinity, limit);

            if(otherDatas.length) {
                const sum = otherDatas.reduce( (total, d) => +total + d[settings.metric], 0);
                topData.push({
                    [settings.dimension]: settings.otherOptions.label ? settings.otherOptions.label : 'Others',
                    [settings.metric]: sum,
                });
            }

            cfData.remove();
            return topData;
        }

        return data;
    }

    getOpacity(d) {
        const {
            configuration,
            context
        } = this.props;
        let vkey = `${configuration.id.replace(/-/g, '')}vkey`;
        return (!context[vkey] || !configuration.key || context[vkey]  === evalExpression("(" + configuration.key + ")")(d)) ? "1" : "0.5"
    }

    renderNewLegend(data, legendConfig, getColor, label) {

        if (!legendConfig || !legendConfig.show)
            return;

        const {
            width,
            height
        } = this.props;

        const {
            margin,
            fontColor,
            circleToPixel,
        } = this.getConfiguredProperties();

        const isVertical = legendConfig.orientation === 'vertical';
        const lineHeight = legendConfig.circleSize * circleToPixel;
        const x          = legendConfig.circleSize + legendConfig.labelOffset;
        const radius     = legendConfig.circleSize;
        let transform;

        if (isVertical)
        {
            let top  = height - (margin.bottom + ((data.length - 1) * lineHeight));
            transform = (d,i) => `translate(${margin.left}, ${top + (i *  lineHeight)})`;

        } else {
            // Place legends horizontally
            const availableWidth    = width - margin.left - margin.right;
            const legendWidth       = legendConfig.width + legendConfig.circleSize + 2 * legendConfig.labelOffset;
            const nbElementsPerLine = parseInt(availableWidth / legendWidth, 10);
            const nbLines           = parseInt(data.length / nbElementsPerLine, 10);
            const top               = height - (margin.bottom + (nbLines * lineHeight));

            transform = (d, i) => `translate(${margin.left + ((i % nbElementsPerLine) * legendWidth)}, ${top + parseInt(i / nbElementsPerLine, 10) * lineHeight})`;
        }

        const legends = this.getSVG().select('.legend').selectAll('.legend-item')
          .data(data);

        const newLegends = legends.enter().append('g')
          .attr('class', 'legend-item');

        newLegends.append('circle')
          .attr('class', 'item-circle');

        newLegends.append('text')
          .attr('class', 'item-text')
          .style('alignment-baseline', 'central');


        const allLegends = newLegends.merge(legends);

        allLegends
          .attr("transform", transform );

        allLegends.selectAll('.item-circle')
          .attr('r', radius)
          .style('fill', d => getColor(d));

        allLegends.selectAll('.item-text')
          .attr('x', x)
          .style('fill', fontColor)
          .text( d => label(d));

        legends.exit().remove();
    }

}
