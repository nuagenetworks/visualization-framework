import React from "react";

import tabify from "../../utils/tabify";
import * as d3 from "d3";

export default class PieGraph extends React.Component {
    constructor(){
        super();

        // These properties can be overridden from the configuration.
        this.defaults = {

            // The following radius values are as a percentage of min(width, height).
            pieInnerRadius: 0, // The inner radius of the slices. Make this non-zero for a Donut Chart.
            pieOuterRadius: 0.8, // The outer radius of the slices.
            pieLabelRadius: 0.85, // The radius for positioning labels.

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

        const maxRadius = Math.min(width, height) / 2;
        const innerRadius = pieInnerRadius * maxRadius;
        const outerRadius = pieOuterRadius * maxRadius;
        const labelRadius = pieLabelRadius * maxRadius;

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
                <svg width={width} height={height}>
                    <g transform={ `translate(${ width / 2 }, ${ height / 2 })` } >
                        {
                            slices.map((slice, i) => (
                                <g key={i} >
                                    <path
                                      d={arc(slice)}
                                      style={sliceStyle}
                                      fill={color(i)}
                                    />
                                    <text
                                      transform={`translate(${labelArc.centroid(slice)})`}
                                      textAnchor={(slice.startAngle + slice.endAngle) / 2 < Math.PI ? "start" : "end"}
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
