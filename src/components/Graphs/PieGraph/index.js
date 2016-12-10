import React from "react";

import AbstractGraph from "../AbstractGraph";

import * as d3 from "d3";

import "./style.css";

import {properties} from "./default.config"


export default class PieGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }

    renderLegend(legend, getColor, label) {

        if (!legend.show)
            return;

        const {
            data,
            width,
            height
        } = this.props;

        const {
          margin,
          fontColor,
        } = this.getConfiguredProperties();

        const isVertical = legend.orientation === 'vertical';
        const lineHeight = legend.circleSize * legend.circleToPixel;

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
        const labelWidth        = legend.longestLabel.length * legend.charToPixel;
        const nbElementsPerLine = parseInt(availableWidth / labelWidth, 10);
        const nbLines           = parseInt(data.length / nbElementsPerLine, 10);
        const left              = margin.left;
        const top               = height - (margin.bottom + (nbLines * lineHeight));

        return (
            <g>
                {data.map((d, i) => {
                    const x = left + ((i % nbElementsPerLine) * labelWidth);
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

    render() {

        const {
            data,
            width,
            height,
            onMarkClick
        } = this.props;

        if (!data || !data.length)
            return;

        const {
          colorColumn,
          sliceColumn,
          labelColumn,
          legend,
          margin,
          pieInnerRadius,
          pieOuterRadius,
          pieLabelRadius,
          stroke,
          fontColor,
          percentages,
          percentagesFormat,
        } = this.getConfiguredProperties();

        let availableWidth     = width - (margin.left + margin.right);
        let availableHeight    = height - (margin.top + margin.bottom);

        const isVerticalLegend = legend.orientation === 'vertical';
        const value            = (d) => d[sliceColumn];
        const label            = (d) => d[labelColumn];
        const scale            = this.scaleColor(data, labelColumn);
        const getColor         = (d) => scale ? scale(d[colorColumn || labelColumn]) : null;

        if (legend.show)
        {
            // Extract the longest legend
            // Store the info in legend for convenience
            legend.longestLabel = label(data.reduce((a, b) => {
                return label(a).length > label(b).length ? a : b;
            }));

            // Compute the available space considering a legend
            if (isVerticalLegend)
                availableWidth -= legend.longestLabel.length * legend.charToPixel;
            else
                availableHeight -= (data.length - 1) * legend.circleSize * legend.circleToPixel;
        }

        const maxRadius   = Math.min(availableWidth, availableHeight) / 2;
        const innerRadius = pieInnerRadius * maxRadius;
        const outerRadius = pieOuterRadius * maxRadius;
        const labelRadius = pieLabelRadius * maxRadius;

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const labelArc = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const pie    = d3.pie().value(value);
        const slices = pie(data);

        const labelText = (() => {
            if (percentages) {
                const percentageFormat = d3.format(percentagesFormat || ",.2%");
                const sum              = d3.sum(data, value);
                return (d) => percentageFormat(value(d) / sum);
            }
            return label;
        })();

        let strokeStyle = {
            strokeWidth: stroke.width,
            stroke: stroke.color
        }

        return (
            <div className="pie-graph">
                {this.tooltip}
                <svg width={ width } height={ height }>
                    <g transform={ `translate(${ width / 2 }, ${ height / 2 })` } >
                        {
                            slices.map((slice, i) => {
                                const d = slice.data;

                                // Set up clicking and cursor style.
                                const { onClick, cursor } = (
                                    onMarkClick ? {
                                        onClick: () => onMarkClick(d),
                                        cursor: "pointer"
                                    } : { }
                                );

                                const textAnchor = (
                                  (pieLabelRadius > pieOuterRadius)
                                  ? ((slice.startAngle + slice.endAngle) / 2 < Math.PI ? "start" : "end")
                                  : "middle"
                                );

                                return <g key={i} >
                                    <path
                                      d={ arc(slice) }
                                      fill={ getColor(d) }
                                      onClick={ onClick }
                                      style={ Object.assign({cursor}, strokeStyle) }
                                      { ...this.tooltipProps(d) }
                                    />
                                    <text
                                      transform={`translate(${labelArc.centroid(slice)})`}
                                      textAnchor={ textAnchor }
                                      dy=".35em"
                                      fill={ fontColor }
                                      onClick={ onClick }
                                      style={{cursor}}
                                      { ...this.tooltipProps(d) }
                                    >
                                        { labelText(slice.data) }
                                    </text>
                                </g>
                            })
                        }
                    </g>

                    {this.renderLegend(legend, getColor, label)}
                </svg>
            </div>
        );
    }
}

PieGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.array
};
