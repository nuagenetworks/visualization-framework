import React from "react";
import AbstractGraph from "./AbstractGraph";

export default class XYGraph extends AbstractGraph {

    constructor(props, properties = {}) {
        super(props, properties);
    }

    axisLabels() {

        const { width, height } = this.props;

        const {
          margin: { top, bottom, left, right },
          xColumn,
          xLabel,
          xLabelOffset,
          xLabelSize,
          yColumn,
          yLabel,
          yLabelOffset,
          yLabelSize,
        } = this.getConfiguredProperties();

        const innerWidth = width - left - right;
        const innerHeight = height - top - bottom;

        return (
            <g>
                { xLabel ? (
                    <text
                        className="axis-label"
                        x={ left + (innerWidth / 2) }
                        y={ height - xLabelOffset }
                        textAnchor="middle"
                        fontSize={xLabelSize + "px"}
                    >
                      { xLabel === true ? xColumn : xLabel}
                    </text>
                  ) : null
                }
                { yLabel ? (
                    <text
                        className="axis-label"
                        transform={[
                          "translate(",
                          yLabelOffset,
                          ",",
                          top + innerHeight / 2,
                          ") rotate(-90)"
                        ].join("")}
                        textAnchor="middle"
                        fontSize={yLabelSize + "px"}
                    >
                      { yLabel === true ? yColumn : yLabel}
                    </text>
                  ) : null
                }
            </g>
        );
    }
}
XYGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.object
};
