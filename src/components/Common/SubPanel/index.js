import React, { Component } from "react";
import style from "./style";

export default class SubPanel extends Component {
  render() {
    return (
        <div style={style.panel}>
            <div style={style.panelHeading}>
                <h4>{this.props.title}</h4>
            </div>
            <div style={style.panelBody}>
              {this.props.children}
            </div>
        </div>
    )
  }
}
