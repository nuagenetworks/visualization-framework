import React, { Component } from "react";
import style from "./style";

export default class Error extends Component {
  render() {
    let errors = this.props.data;
    if(typeof errors == "string")
      errors = JSON.parse(errors);

    if(!errors || !errors.length)
      return null;

    const listItems = errors.map((error, index) =>
        <li key={index}>{error}</li>
      );


    return (
        <div style={style.error}>
            <ul style={style.ul}>{listItems}</ul>
        </div>
    )
  }
}
