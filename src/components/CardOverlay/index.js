import React from "react";

import style from "./styles";


export class CardOverlay extends React.Component {

    render() {
        const overlayStyle = Object.assign({}, style.overlayContainer, this.props.overlayStyle);
        let textStyle = Object.assign({}, style.overlayText, this.props.textStyle, this.props.alignCenter);


        return (
            <div style={overlayStyle} onTouchTap={this.props.onTouchTapOverlay}>
                <div style={textStyle}>
                    {this.props.text}
                </div>
            </div>
        )
    }
}

CardOverlay.propTypes = {
    overlayStyle: React.PropTypes.object,
    textStyle: React.PropTypes.object
};
