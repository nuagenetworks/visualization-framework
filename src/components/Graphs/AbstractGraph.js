import React from "react";
import { scaleOrdinal } from "d3";
import ReactTooltip from "react-tooltip";

import * as d3 from "d3";

import { GraphManager } from "./index";
import columnAccessor from "../../utils/columnAccessor";


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
        domainData.map((d) => {
            if(mapColors[d]) {
              propColors.push(mapColors[d]);
            }
        })
        propColors = propColors.concat(colors);

        const scale = scaleOrdinal(propColors);
        scale.domain(domainData);

        return scale;
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
        const longestLabel = label(data.reduce((a, b) => {
            let labelA = label(a);
            let labelB = label(b);

            if (!labelA)
                return b;

            if (!labelB)
                return a;

            return format(labelA.toString()).length > format(labelB.toString()).length ? a : b;
        })).toString();

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

}
