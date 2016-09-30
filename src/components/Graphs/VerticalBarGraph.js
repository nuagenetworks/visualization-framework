import React from "react";

import CircularProgress from "material-ui/CircularProgress";
import tabify from "../../utils/tabify";

/*
    This is a very basic graph that displays a text message
*/
class SimpleTextGraph extends React.Component {
    render() {
        const { response, queryConfiguration } = this.props;
        let body;

        if (response && !response.isFetching) {
            const data = tabify(response.results);
            body = (
                <pre>{ JSON.stringify(data, null, 2) }</pre>
            );
        }
        else {

            body = (
                <div>
                    <CircularProgress color="#eeeeee" /> Loading graph
                </div>
            );
        }

        return (
            <div>
                { body }
            </div>
        );
    }
}

SimpleTextGraph.propTypes = {
  title: React.PropTypes.string,
  response: React.PropTypes.object
};

export default SimpleTextGraph;
