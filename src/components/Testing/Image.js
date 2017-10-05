import React, { Component } from "react";
import style from "./style";

export default class Image extends Component {


  render() {
    return (
      <div className="text-center" style={{ flex: 5}}>
        <img style={style.image} role="presentation" src={this.props.data} />
      </div>
    )
  }
}
