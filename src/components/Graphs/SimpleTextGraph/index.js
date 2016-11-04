import React from "react";

import CircularProgress from "material-ui/CircularProgress";

import "./style.css";

/*
    This is a very basic graph that displays a text message
*/
export default class SimpleTextGraph extends React.Component {
    render() {
        const {
            response,
            queryConfiguration,
            width,
            height,
            configuration: {
                data: {
                    circle,
                    circleColor
                }
            },
            onMarkClick
        } = this.props;

        let body;
        if (response && !response.isFetching) {
            body = (
                <div className="SimpleTextGraph">
                    {(() => {
                        if(circle){
                            const padding = 16;
                            const side = width * 0.3;
                            return (
                                <div style={{
                                    position: "fixed",
                                    left: width / 2 - side / 2 + padding,
                                    width: side + "px",
                                    height: side + "px",
                                    borderRadius: "50%",
                                    background: circleColor || "gray",
                                    textAlign: "center"
                                }}/>
                            );
                        }
                    })()}
                    <div className="BigNumber">
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

        const cursor = onMarkClick ? "pointer" : undefined;

        return (
            <div className="text-center" style={{ height: height, cursor: cursor}}>
                { body }
            </div>
        );
    }
}

SimpleTextGraph.propTypes = {
  configuration: React.PropTypes.object,
  response: React.PropTypes.object
};
