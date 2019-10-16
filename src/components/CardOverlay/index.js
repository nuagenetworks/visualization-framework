import React from "react";
import PropTypes from "prop-types";

import style from "./styles";


export class CardOverlay extends React.Component {

    render() {
        const overlayStyle = Object.assign({}, style.overlayContainer, this.props.overlayStyle);
        let textStyle = Object.assign({}, style.overlayText, this.props.textStyle);
        let text = typeof this.props.text === 'string' ? this.props.text.split('\n').map((item, key) => {
            return <span key={key}>{item}<br/></span>
            }) : this.props.text

        return (
            <div style={overlayStyle} onClick={this.props.onTouchTapOverlay}>
                <div style={textStyle}>
                    {text}
                </div>
            </div>
        )
    }
}

CardOverlay.propTypes = {
    overlayStyle: PropTypes.object,
    textStyle: PropTypes.object
};
