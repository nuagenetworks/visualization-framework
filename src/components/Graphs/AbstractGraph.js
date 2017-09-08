import React from "react";
import { scaleOrdinal } from "d3";
import ReactTooltip from "react-tooltip";

import * as d3 from "d3";

import { GraphManager } from "./index";
import columnAccessor from "../../utils/columnAccessor";
import crossfilter from "crossfilter2";


export default class AbstractGraph extends React.Component {

    constructor(props, properties = {}) {
        super(props);

        this.defaults = GraphManager.getDefaultProperties(properties);

        // Provide tooltips for subclasses.
        const { tooltip } = this.getConfiguredProperties();
        if(tooltip) {

            // Generate accessors that apply number and date formatters.
            const accessors = tooltip.map(columnAccessor);

            // This function is invoked to produce the content of a tooltip.
            this.getTooltipContent = () => {

                // The value of this.hoveredDatum should be set by subclasses
                // on mouseEnter and mouseMove of visual marks
                // to the data entry corresponding to the hovered mark.
                if(this.hoveredDatum) {
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
                                        {accessors[i](this.hoveredDatum)}
                                    </span>
                                </div>
                            ))}
                        </div>
                    );
                } else {
                    return null;
                }
            }

            // Use a unique tooltip ID per visualization,
            // otherwise there are overlapping tooltips.
            const tooltipId = String(Math.random());

            // Expose tooltipId in case subclasses need it.
            this.tooltipId = tooltipId;

            // This JSX object can be used by subclasses to enable tooltips.
            this.tooltip = (
                <ReactTooltip
                    id={ tooltipId }
                    place="top"
                    type="dark"
                    effect="float"
                    getContent={[() => this.getTooltipContent(), 200]}
                />
            );

            // Subclasses can enable tooltips on their marks
            // by spreading over the return value from this function
            // when invoked with the mark's data element `d` like this:
            // data.map((d) => <rect { ...this.tooltipProps(d) } />
            this.tooltipProps = (d) => ({
                "data-tip": true,
                "data-for": tooltipId,
                "onMouseEnter": () => this.hoveredDatum = d,
                "onMouseMove": () => this.hoveredDatum = d
            });

        } else {
            this.getTooltipContent = () => null
            this.tooltipProps = () => null
        }
    }

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

    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
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

    getGroupedData(data, settings) {

        let cfData = crossfilter(data);

        let metricDimension = cfData.dimension(function(d) { return d[settings.metric]; });
        let topData = [];

        if(settings.otherOptions && settings.otherOptions.limit && data.length > settings.otherOptions.limit) {
            
            topData = metricDimension.top(settings.otherOptions.limit);
            const otherDatas = metricDimension.top(Infinity, settings.otherOptions.limit);

            const sum = otherDatas.reduce(function(total, d) {
              return +total + d[settings.metric];
            }, 0);

            topData = topData.concat({[settings.dimension]: settings.otherOptions.label, [settings.metric]: sum})
        } else {
            topData = metricDimension.top(Infinity);
        }

        metricDimension.remove();
        cfData.remove();

        return topData;
    }

    getOpacity(d) {
        const {
            configuration,
            context
        } = this.props;
        let vkey = `${configuration.id.replace(/-/g, '')}vkey`;
        return (!context[vkey] || !configuration.key || context[vkey]  === eval("(" + configuration.key + ")")(d)) ? "1" : "0.5"
    }

}
