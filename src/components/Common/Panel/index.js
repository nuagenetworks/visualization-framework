import React, { Component } from "react";
import style from "./style";

export default class Panel extends Component {
  render() {
    return (
        <div style={style.panel}>
            <div style={style.panelHeading}>
                <h2>{this.props.title}</h2>
            </div>
            <div style={style.panelBody}>
              {this.props.children}
            </div>
        </div>
    )
  }
}
