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

        const { data, width, height, onMarkClick } = this.props;

        if (!data || !data.length)
            return;

        const {
          colorColumn,
          sliceColumn,
          labelColumn,
          pieInnerRadius,
          pieOuterRadius,
          pieLabelRadius,
          stroke,
          fontColor,
          percentages,
          percentagesFormat
        } = this.getConfiguredProperties();

        const maxRadius = Math.min(width, height) / 2;
        const innerRadius = pieInnerRadius * maxRadius;
        const outerRadius = pieOuterRadius * maxRadius;
        const labelRadius = pieLabelRadius * maxRadius;


        const value = (d) => d[sliceColumn];
        const label = (d) => d[labelColumn];

        const pie = d3.pie().value(value);

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const slices = pie(data);

        const percentageFormat = d3.format(percentagesFormat || ",.2%");
        const sum = d3.sum(data, value);
        const percentage = (d) => percentageFormat(value(d) / sum);

        const labelText = (d) => percentages ? percentage(d) : label(d);

        const labelArc = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        let defaultStyle = {
            strokeWidth: stroke.width,
            stroke: stroke.color
        }

        const scale = this.scaleColor(data, labelColumn);

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

                                return <g key={i} >
                                    <path
                                      d={ arc(slice) }
                                      fill={ scale ? scale(d[colorColumn || labelColumn]) : null }
                                      onClick={ onClick }
                                      style={ Object.assign({cursor}, defaultStyle) }
                                      { ...this.tooltipProps(d) }
                                    />
                                    <text
                                      transform={`translate(${labelArc.centroid(slice)})`}
                                      textAnchor={(slice.startAngle + slice.endAngle) / 2 < Math.PI ? "start" : "end"}
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
                </svg>
            </div>
        );
    }
}
PieGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.object
};
