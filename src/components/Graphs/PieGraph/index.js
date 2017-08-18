import React from "react";

import AbstractGraph from "../AbstractGraph";

import * as d3 from "d3";

import "./style.css";

import {properties} from "./default.config"


export default class PieGraph extends AbstractGraph {

    constructor(props) {
        super(props, properties);
    }

    render() {

        const {
            data: originalData,
            width,
            height,
            onMarkClick
        } = this.props;


        if (!originalData || !originalData.length)
            return;

        const {
          chartWidthToPixel,
          circleToPixel,
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
          otherOptions
        } = this.getConfiguredProperties();


        /*
        Add below code snippet in visulaization's configuration json files
        to use grouping data feature

        "others": {
            "label": "Others",
            "limit": 5
        }

        */

        const data = this.getGroupedData(originalData, {
            "metric": sliceColumn,
            "dimension": labelColumn,
            "otherOptions": otherOptions
          });

        let availableWidth     = width - (margin.left + margin.right);
        let availableHeight    = height - (margin.top + margin.bottom);

        const isVerticalLegend = legend.orientation === 'vertical';
        const value            = (d) => d[sliceColumn];
        const label            = (d) => d[labelColumn];
        const scale            = this.scaleColor(data, labelColumn);
        const getColor         = (d) => scale ? scale(d[colorColumn || labelColumn]) : null;

        if (legend.show && data.length > 1)
        {
            // Extract the longest legend
            // Store the info in legend for convenience
            legend.width = this.longestLabelLength(data, label) * chartWidthToPixel;

            // Compute the available space considering a legend
            if (isVerticalLegend)
                availableWidth -= legend.width;
            else
                availableHeight -= (data.length - 1) * legend.circleSize * circleToPixel;
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

        const pie    = d3.pie().value(value).sort(null);
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

                    {this.renderLegend(data, legend, getColor, label)}
                </svg>
            </div>
        );
    }
}

PieGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.array
};
