import React from "react";

import tabify from "../../utils/tabify";
import * as d3 from "d3";

import { theme } from "../../theme";

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
            sliceColors: [
                theme.palette.yellowLightColor,
                theme.palette.orangeLightColor,
                theme.palette.blueLightColor,
                theme.palette.pinkLightColor,
                theme.palette.greenColor,
                theme.palette.yellowDarkColor,
                theme.palette.orangeLighterColor,
            ]
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
