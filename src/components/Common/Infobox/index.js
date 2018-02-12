import React, { Component } from "react";
import style from "./style";

export default class Infobox extends Component {
  render() {
    if(!this.props.data)
      return null;

    return (
      <div style={style.infobox}>
          <i className="fa fa-info-circle" aria-hidden="true"></i> {this.props.data}
      </div>
    )
  }
}
