import React from "react";

import CircularProgress from "material-ui/CircularProgress";

/*
    This is a very basic graph that displays a text message
*/
export default class SimpleTextGraph extends React.Component {
    render() {
        const { response, configuration } = this.props;
        let body;

        if (response && !response.isFetching) {
            body = (
                <div>
                    {response.results.length}
                    <br />
                    {configuration.title}
                </div>
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
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
