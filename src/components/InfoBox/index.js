import React from "react";
import Modal from 'react-modal';

import style from './styles';

Modal.setAppElement('#modalPopup')

export default class InfoBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: true
    };

  }

  render() {
    //let Script = this.getScript(this.props.script);

    let { onInfoBoxClose, children } = this.props;
    let { modalIsOpen } = this.state;
    return (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={onInfoBoxClose}
          style={style}
        >
          { children }
        </Modal>
    );
  }
}
