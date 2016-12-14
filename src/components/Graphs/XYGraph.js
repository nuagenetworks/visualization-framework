import React from "react";
import AbstractGraph from "./AbstractGraph";

export default class XYGraph extends AbstractGraph {

    constructor(props, properties = {}) {
        super(props, properties);
    }

    writeYLabel(x, y) {

    }

    writeXLabel(x, y) {

    }

    axisTitles(xLabelPosition, yLabelPosition) {

        const {
          xColumn,
          xLabel,
          xLabelSize,
          yColumn,
          yLabel,
          yLabelSize,
        } = this.getConfiguredProperties();

        return (
            <g>
                { xLabel ? (
                    <text
                        className="axis-label"
                        x={ xLabelPosition.left }
                        y={ xLabelPosition.top }
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
                          yLabelPosition.left ,
                          ",",
                          yLabelPosition.top,
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
  data: React.PropTypes.array
};
