import React, { Component } from "react";
import style from "./style";
import Lightbox from 'react-image-lightbox';
export default class Image extends Component {
  constructor(props) {
    super(props);
    this.state = {
        photoIndex: 0,
        isOpen: false
    };
  }

  render() {
    const images = [
      this.props.data
    ];
    const {
      photoIndex,
      isOpen,
    } = this.state;

    return (
      <div className="text-center" style={{ flex: 5}}>
        <img style={style.image} role="presentation" src={images} title="Click to enlarge" onClick={() => this.setState({ isOpen: true })} />
        {isOpen &&
	        <Lightbox
		        mainSrc={images[photoIndex]}
		        onCloseRequest={() => this.setState({ isOpen: false })}
	        />
        }
      </div>
    )
  }
}
