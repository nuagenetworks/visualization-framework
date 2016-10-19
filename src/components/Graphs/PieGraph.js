import React from "react";

import tabify from "../../utils/tabify";
import * as d3 from "d3";

export default class PieGraph extends React.Component {
    constructor(){
        super();

        // These properties can be overridden from the configuration.
        // TODO unify these at a base class inherited by both bar chart and line chart.
        this.defaults = {
            pieInnerRadius: 0, // The inner radius of the pie chart as a percentage of min(width, height)
            pieOuterRadius: 0.8 // The outer radius of the pie chart as a percentage of min(width, height)
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
          pieInnerRadius,
          pieOuterRadius
        } = this.getConfiguredProperties();

        const side = Math.min(width, height);
        const innerRadius = pieInnerRadius * side;
        const outerRadius = pieOuterRadius * side;

        const top = 0; // TODO compute top and left
        const left = 0;

        const pie = d3.pie()
            .value(function (d){ return d[sliceColumn] });

        const arc = d3.arc()
            .innerRadius(innerRadius)
            .outerRadius(outerRadius);

        const slices = pie(data)
        console.log(data)
        console.log(slices)
        console.log(arc(slices[0]))
        return (
            <div className="pie-graph">
                <svg width={side} height={side}>
                    <g transform={ `translate(${left},${top})` } >
                        {
                            slices.map((slice) => (
                                <path d={arc(slice)} />
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
