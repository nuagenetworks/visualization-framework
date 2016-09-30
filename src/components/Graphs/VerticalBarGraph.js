import React from "react";
import ReactDOM from "react-dom";

import CircularProgress from "material-ui/CircularProgress";
import tabify from "../../utils/tabify";
import { select } from "d3";

/*
    This is a very basic graph that displays a text message
*/
class VerticalBarGraph extends React.Component {

    componentDidMount(){
        this.svg = ReactDOM.findDOMNode(this.refs.svg);
        select(this.svg)
          .append("rect")
            .attr("width", 500)
            .attr("height", 500);
    }

    render() {
        const { response, queryConfiguration } = this.props;
        const data = tabify(response.results);
        return (
            <svg ref="svg" />
        );
    }
}

VerticalBarGraph.propTypes = {
  title: React.PropTypes.string,
  response: React.PropTypes.object
};

export default VerticalBarGraph;
