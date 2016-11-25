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
          percentagesFormat,
          colorLegend,
          colorLegendHeight,
          colorLegendSpacing
        } = this.getConfiguredProperties();

        const innerHeight = height - (colorLegend ? colorLegendHeight : 0);
        const maxRadius = Math.min(width, innerHeight) / 2;
        const innerRadius = pieInnerRadius * maxRadius;
        const outerRadius = pieOuterRadius * maxRadius;
        const labelRadius = pieLabelRadius * maxRadius;

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const labelArc = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        const value = (d) => d[sliceColumn];
        const label = (d) => d[labelColumn];

        const pie = d3.pie().value(value);
        const slices = pie(data);

        const labelText = (() => {
            if(percentages){
                const percentageFormat = d3.format(percentagesFormat || ",.2%");
                const sum = d3.sum(data, value);
                return (d) => percentageFormat(value(d) / sum);
            }
            return label;
        })();

        let defaultStyle = {
            strokeWidth: stroke.width,
            stroke: stroke.color
        }

        const scale = this.scaleColor(data, labelColumn);

        const getColor = (d) => scale ? scale(d[colorColumn || labelColumn]) : null;

        return (
            <div className="pie-graph">
                {this.tooltip}
                <svg width={ width } height={ height }>
                    <g transform={ `translate(${ width / 2 }, ${ innerHeight / 2 })` } >
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
                                      fill={ getColor(d) }
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
                    <g>
                        {data.map((d, i) => {
                            const x = width / 2;
                            const y = height - colorLegendHeight;
                            return (
                                <g transform={ `translate(${x}, ${y})` }>
                                    <circle r="10" fill={ getColor(d) } />
                                    <text fill={ fontColor }> {label(d)} </text>
                                </g>
                            );
                        })}
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
