import React from "react";

import AbstractGraph from "../AbstractGraph";

import tabify from "../../../utils/tabify";
import * as d3 from "d3";

import "./style.css";


export default class PieGraph extends AbstractGraph {

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

        return (
            <div className="pie-graph">
                <svg width={ width } height={ height }>
                    <g transform={ `translate(${ width / 2 }, ${ height / 2 })` } >
                        {
                            slices.map((slice, i) => (
                                <g key={i} >
                                    <path
                                      d={ arc(slice) }
                                      style={ {strokeWidth: stroke.width, stroke: stroke.color} }
                                      fill={ this.applyColor(i) }
                                    />
                                    <text
                                      transform={`translate(${labelArc.centroid(slice)})`}
                                      textAnchor={(slice.startAngle + slice.endAngle) / 2 < Math.PI ? "start" : "end"}
                                      dy=".35em"
                                      fill={ fontColor }
                                    >
                                        { slice.data[labelColumn] }
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
