import React, { PropTypes } from "react";
import Modal from 'react-modal';
import RaisedButton from 'material-ui/RaisedButton';

import style from './styles';

const propTypes = {
  onInfoBoxClose: PropTypes.func,
};

Modal.setAppElement('#modalPopup');

export default class InfoBox extends React.Component {

  constructor(props) {
    super(props);

    this.state = {
      modalIsOpen: true
    };

  }

  render() {

    const { onInfoBoxClose, children } = this.props;
    const { modalIsOpen } = this.state;
    return (
        <Modal
          isOpen={modalIsOpen}
          onRequestClose={onInfoBoxClose}
          style={style.modal}
        >
          <div>
            <div style={style.container}>
              { children }
            </div>
            <div style={style.footer}>
              <RaisedButton 
                label="Close"
                backgroundColor={style.button.background}
                labelColor={style.button.label}
                onClick={onInfoBoxClose} 
              />
            </div>
          </div>
        </Modal>
    );
  }
}

InfoBox.propTypes = propTypes;
