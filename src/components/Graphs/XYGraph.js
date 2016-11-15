import React from "react";
import AbstractGraph from "./AbstractGraph";

export default class XYGraph extends AbstractGraph {
}
XYGraph.propTypes = {
  configuration: React.PropTypes.object,
  data: React.PropTypes.object
};
