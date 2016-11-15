import React from "react";

import AbstractGraph from "../AbstractGraph";

import * as d3 from "d3";

import "./style.css";


export default class PieGraph extends AbstractGraph {

    render() {

        const { data, width, height, onMarkClick } = this.props;

        if (!data || !data.length)
            return;

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
                                      fill={ this.applyColor(i) }
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
  data: React.PropTypes.object
};
