import React from "react";

import CircularProgress from "material-ui/CircularProgress";

import "./SimpleTextGraph.css";

/*
    This is a very basic graph that displays a text message
*/
export default class SimpleTextGraph extends React.Component {
    render() {
        const { response, queryConfiguration } = this.props;
        let body;

        if (response && !response.isFetching) {
            body = (
                <div className="SimpleTextGraph">
                    {response.results.length}
                    <br />
                    {queryConfiguration.title}
                </div>
            );
        }
        else {

            body = (
                <CircularProgress color="#eeeeee" />
            );
        }

        return (
            <div className="text-center">
                { body }
            </div>
        );
    }
}

SimpleTextGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
