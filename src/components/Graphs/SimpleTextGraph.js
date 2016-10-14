import React from "react";

import CircularProgress from "material-ui/CircularProgress";

import "./SimpleTextGraph.css";

/*
    This is a very basic graph that displays a text message
*/
export default class SimpleTextGraph extends React.Component {
    render() {
        const { response, queryConfiguration } = this.props;

        let numberStyle = {};
        if(this.props.configuration.data.circle){
            const side = this.props.width * 0.5;
            numberStyle = {
                width: side + "px", 
                height: side + "px",
                borderRadius: "50%",
                background: this.props.configuration.data.circleColor || "gray"
            };
        }

        let body;
        if (response && !response.isFetching) {
            body = (
                <div className="SimpleTextGraph">
                    <div className="BigNumber" style={numberStyle}>
                      {response.results.length}
                    </div>
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
            <div className="text-center" style={{ height: this.props.height}}>
                { body }
            </div>
        );
    }
}

SimpleTextGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
