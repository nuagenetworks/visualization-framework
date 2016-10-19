import React from "react";

import tabify from "../../utils/tabify";
import * as d3 from "d3";

export default class PieGraph extends React.Component {
    constructor(){
        super();

        // These properties can be overridden from the configuration.
        // TODO unify these at a base class inherited by both bar chart and line chart.
        this.defaults = {

            // The following radius values are as a percentage of min(width, height).
            pieInnerRadius: 0, // The inner radius of the slices. Make this non-zero for a Donut Chart.
            pieOuterRadius: 0.8, // The outer radius of the slices.
            pieLabelRadius: 0.6, // The radius for positioning labels.

            sliceStyle: {
                stroke: "white",
                strokeWidth: "1px"
            },

            // From ColorBrewer Scales, Set2 https://bl.ocks.org/mbostock/5577023
            sliceColors: ["#66c2a5","#fc8d62","#8da0cb","#e78ac3","#a6d854","#ffd92f","#e5c494","#b3b3b3"]
        };
    }

    // Gets the object containing all configured properties.
    // Uses properties from the configuration,
    // falling back to defaults for unspecified properties.
    // TODO move this to a base class
    getConfiguredProperties() {
        return Object.assign({}, this.defaults, this.props.configuration.data);
    }

    render() {

        const { response, width, height } = this.props;

        if (!response || response.error)
            return;

        const data = tabify(response.results);

        const {
          sliceColumn,
          labelColumn,
          pieInnerRadius,
          pieOuterRadius,
          pieLabelRadius,
          sliceStyle,
          sliceColors
        } = this.getConfiguredProperties();

        const side = Math.min(width, height);
        const innerRadius = pieInnerRadius * side / 2;
        const outerRadius = pieOuterRadius * side / 2;
        const labelRadius = pieLabelRadius * side / 2;

        const top = side / 2; // TODO compute top and left
        const left = side / 2;

        const pie = d3.pie()
            .value(function (d){ return d[sliceColumn] });

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const slices = pie(data);

        const color = d3.scaleOrdinal(sliceColors);

        const labelArc = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        return (
            <div className="pie-graph">
                <svg width={side} height={side}>
                    <g transform={ `translate(${left},${top})` } >
                        {
                            slices.map((slice, i) => (
                                <g>
                                    <path
                                      d={arc(slice)}
                                      style={sliceStyle}
                                      fill={color(i)}
                                      key={i}
                                    />
                                    <text
                                      transform={`translate(${labelArc.centroid(slice)})`}
                                      textAnchor="middle"
                                      dy=".35em"
                                    >
                                        {slice.data[labelColumn]}
                                    </text>
                                </g>
                            ))
                        }
                    </g>
                </svg>
            </div>
        );
    }
}
PieGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
