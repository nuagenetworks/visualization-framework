import React from "react";

import AbstractGraph from "../AbstractGraph";

import tabify from "../../../utils/tabify";
import * as d3 from "d3";

import "./style.css";


export default class PieGraph extends AbstractGraph {

    render() {

        const { response, width, height, onMarkClick } = this.props;

        if (!response || response.error)
            return;

        const data = tabify(response.results);

        const {
          sliceColumn,
          labelColumn,
          pieInnerRadius,
          pieOuterRadius,
          pieLabelRadius,
          stroke,
          fontColor
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

        const labelArc = d3.arc()
            .innerRadius(labelRadius)
            .outerRadius(labelRadius);

        let defaultStyle = {
            strokeWidth: stroke.width,
            stroke: stroke.color
        }

        const scale = this.scaleColor(data);

        return (
            <div className="pie-graph">
                <svg width={ width } height={ height }>
                    <g transform={ `translate(${ width / 2 }, ${ height / 2 })` } >
                        {
                            slices.map((slice, i) => {

                                // Set up clicking and cursor style.
                                const { onClick, style } = (

                                    // If an "onMarkClick" handler is registered,
                                    onMarkClick ? {

                                        // set it up to be invoked, passing the current data row object.
                                        onClick: () => onMarkClick(slice.data),

                                        // Make the cursor a pointer on hover, as an affordance for clickability.
                                        style: {cursor: "pointer"},

                                    } : {
                                        // Otherwise, set onClick and style to "undefined".
                                    }
                                );

                                return <g key={i} >
                                    <path
                                      d={ arc(slice) }
                                      fill={ scale(i) }
                                      onClick={ onClick }
                                      style={ Object.assign({}, defaultStyle, style) }
                                    />
                                    <text
                                      transform={`translate(${labelArc.centroid(slice)})`}
                                      textAnchor={(slice.startAngle + slice.endAngle) / 2 < Math.PI ? "start" : "end"}
                                      dy=".35em"
                                      fill={ fontColor }
                                      onClick={ onClick }
                                      style={ style }
                                    >
                                        { slice.data[labelColumn] }
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
  response: React.PropTypes.object
};
