import React from "react";


/*
    This is a very basic graph that displays a text message
*/
class SimpleTextGraph extends React.Component {
    render() {
        const { text } = this.props;

        return (
            <div>
                { text }
            </div>
        );
    }
}

SimpleTextGraph.propTypes = {
  text: React.PropTypes.string
};

export default SimpleTextGraph;
