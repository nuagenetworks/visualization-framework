import React from "react";
import { scaleOrdinal } from "d3";
import ReactTooltip from "react-tooltip";
import {Tooltip} from 'react-lightweight-tooltip';

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
        this.accessors = {}
        this.tooltips = {}

        this.brush = false;

        this.setGraphId();

        this.defaults = GraphManager.getDefaultProperties(properties);

        // set all configuration into single object
        this.setConfiguredProperties(this.props);

        // Provide tooltips for subclasses.
        const { tooltip, defaultY } = this.getConfiguredProperties();
        if(tooltip) {

            this.setTooltipAccessor(tooltip);
            this.setTooltipAccessor(defaultY ? defaultY.tooltip : null, 'defaultY')

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

    componentWillReceiveProps(nextProps) {
        this.setConfiguredProperties(nextProps);
    }

    setTooltipAccessor(tooltip, type = 'default') {
        if(!tooltip)
            return;

        this.tooltips[type] = tooltip
        // Generate accessors that apply number and date formatters.
        this.accessors[type] = tooltip.map(columnAccessor);

        // This function is invoked to produce the content of a tooltip.
        this.getTooltipContent = () => {
            // The value of this.hoveredDatum should be set by subclasses
            // on mouseEnter and mouseMove of visual marks
            // to the data entry corresponding to the hovered mark.

            if(this.hoveredDatum) {
                let type = this.hoveredDatum.tooltipName || 'default'
                return this.tooltipContent({tooltip: this.tooltips[type], accessors: this.accessors[type]})
            } else {
                return null;
            }
        }
    }

    tooltipContent({tooltip, accessors}) {
        return (
            <div>
                {/* Display each tooltip column as "label : value". */}
                {tooltip.map(({column, label}, i) => {
                    let data = accessors[i](this.hoveredDatum)

                    return (data !== null && data !== 'undefined') ?
                     (<div key={column}>
                        <strong>
                            {/* Use label if present, fall back to column name. */}
                            {label || column}
                        </strong> : <span>
                            {/* Apply number and date formatting to the value. */}
                            {data}
                        </span>
                    </div>
                    ) : null
                })}
            </div>
        )
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
        var text = d3.select(this);
        var  words = text.text(),

          y = text.attr("y"),
          dy = parseFloat(text.attr("dy")),
          tspan = text.text(null).append("tspan").attr("x", -3).attr("y", y).attr("dy", dy + "em");
          tspan.text(words);

        if(words.length > width) {
            text.style('cursor', 'pointer').append('title').text(words)
            tspan.text(words.substr(0, width) + '...')
        }
      });
    };

    setConfiguredProperties(props) {
        this.configuredProperties = Object.assign({}, this.defaults, props.configuration.data, { multiMenu: props.configuration.multiMenu,  menu: props.configuration.menu });
    }

    getConfiguredProperties() {
        return this.configuredProperties;
    }

    getMappedScaleColor(data, defaultColumn) {
        const {
            heatmapColor,
            otherColors,
            mapColors,
            colorColumn,
        } = this.getConfiguredProperties();

        if (!colorColumn && !defaultColumn)
            return;

        let domainData = d3.map(data, (d) => d[colorColumn || defaultColumn]).keys().sort();
        let colors = Object.assign({}, mapColors, heatmapColor ? heatmapColor : {})

        let propColors = [];
        let index = 0;
        domainData.forEach((d) => {
            if(colors[d]) {
                propColors.push(colors[d]);
            } else {
                propColors.push(otherColors[index++]);
            }
        })
        propColors = propColors.concat(otherColors);

        const scale = scaleOrdinal(propColors);
        scale.domain(domainData);

        return scale;
    }

    updateYExtent(yExtent, zeroStart) {
      let padding = 0.10;

      if(zeroStart && yExtent[0] > 0) {
        yExtent[0] = 0;
      }

      if(zeroStart && yExtent[1] < 0) {
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
        let labelSize = format(longestLabel).length
        // and return its length + 2 to ensure we have enough space
        return  labelSize > 5 ?  labelSize : labelSize + 2
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
          yTickFormat,
          yLabelLimit,
          appendCharLength
        } = this.getConfiguredProperties();

        yColumn = yColumn ? yColumn : 'yColumn'
        const yLabelFn = (d) => {
            if(!yTickFormat) {
                return d[yColumn];
            }
            const formatter = format(yTickFormat);

            return formatter(d[yColumn]);
        };

        let labelLength = this.longestLabelLength(data, yLabelFn)
        this.yLabelWidth = (labelLength > yLabelLimit ? yLabelLimit + appendCharLength : labelLength) * chartWidthToPixel

    }

    getYlabelWidth() {
        return this.yLabelWidth;
    }

    setDimensions(props, data = null, column = null) {
        this.setYlabelWidth(data ? data : props.data, column);

        this.setLeftMargin();
        this.setAvailableWidth(props);
        this.setAvailableHeight(props);
    }

    // check condition to apply brush on chart
    isBrushable(data = []) {
        const {
            brush
        } = this.getConfiguredProperties()

        this.brush = brush && brush < data.length
    }

    isBrush() {
        return this.brush
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
          margin
        } = this.getConfiguredProperties();

        this.availableWidth = width - (margin.left + margin.right + this.getYlabelWidth());

        if(this.isBrush() && !this.isVertical()) {
            this.availableWidth = this.availableWidth * 0.80
            this.availableMinWidth = width - (this.availableWidth + this.getLeftMargin() + margin.left + margin.right + margin.left )
            this.minMarginLeft = this.availableWidth + this.getLeftMargin() + margin.left           
        }
    }

    getAvailableWidth() {
       return this.availableWidth;
    }

    getAvailableMinWidth() {
        return this.availableMinWidth;
    }

    getMinMarginLeft() {
        return this.minMarginLeft;
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

        this.availableHeight   = height - (margin.top + margin.bottom + chartHeightToPixel + this.getXAxisHeight())        

        if(this.isVertical() && this.isBrush()) {
            this.availableHeight     = this.availableHeight * 0.75
            this.availableMinHeight  = height - (this.availableHeight + (margin.top * 4) + margin.bottom + chartHeightToPixel + this.getXAxisHeight());
            this.minMarginTop        = this.availableHeight + (margin.top * 2) + chartHeightToPixel + this.getXAxisHeight()
        }
    }

    getAvailableHeight() {
        return this.availableHeight;
    }

    getAvailableMinHeight() {
        return this.availableMinHeight;
    }

    getMinMarginTop() {
        return this.minMarginTop;
    }

    // Check whether to display chart as vertical or horizontal
    isVertical() {
        const {
          orientation
        } = this.getConfiguredProperties()

        return orientation === 'vertical'
    }

    // Check whether to display legend as vertical or horizontal
    checkIsVerticalLegend() {
        const {
          legend
        } = this.getConfiguredProperties();

        return legend.orientation === 'vertical';
    }

    getOpacity(d) {
        const {
            configuration,
            context
        } = this.props;
        let vkey = `${configuration.id.replace(/-/g, '')}vkey`;
        return (!context[vkey] || !configuration.key || context[vkey]  === evalExpression("(" + configuration.key + ")")(d)) ? "1" : "0.5"
    }

    // to show message at the center of container
    renderMessage(message) {
        return (
            <div style={{display: "table", width: this.props.width, height: this.props.height}}>
                <div className="center-content">
                    {message}
                </div>
            </div>
        )
    }

    renderNewLegend(data, legendConfig, getColor, label) {

        if (!legendConfig || !legendConfig.show)
            return;

        if(!label)
          label = (d) => d;

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
