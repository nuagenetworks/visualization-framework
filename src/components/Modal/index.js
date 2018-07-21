import React from "react";
import Modal from 'react-modal';
import objectPath from "object-path";

import tableScript from "./tableScript"

const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    minWidth: "500px",
    minHeight: "400px",
    transform: 'translate(-50%, -50%)',
    color: '1px solid rgb(31, 30, 30)',
    border: '1px solid rgb(31, 30, 30)'
  }
};

const scripts = {
  tableScript
}

Modal.setAppElement('#modalPopup')


export default class ModalView extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      modalIsOpen: false
    };

    this.openModal = this.openModal.bind(this);
    this.afterOpenModal = this.afterOpenModal.bind(this);
    this.closeModal = this.closeModal.bind(this);

  }

  componentWillMount() {
    this.initiate(this.props)
  }

  componentWillReceiveProps(nextProps) {
    this.initiate(nextProps)
  }

  /*
    Get the script registered for the given name
  */
  getScript(scriptName) {
    if (!(scriptName in scripts))
        console.error("No script named " + scriptName + " has been registered yet!" );

    return scripts[scriptName];
  }

  initiate(props) {
    this.setState({
      modalIsOpen : props.modalIsOpen || this.state.modalIsOpen
    })
  }

  openModal() {
    this.setState({modalIsOpen: true});
  }

  afterOpenModal() {
  }

  closeModal() {
    this.setState({modalIsOpen: false});
    this.props.closeModal()
  }

  render() {
    let Script = this.getScript(this.props.script);
    return (
      Script && <div>
        <Modal
          isOpen={this.state.modalIsOpen}
          onAfterOpen={this.afterOpenModal}
          onRequestClose={this.closeModal}
          style={customStyles}
        >
          <Script {...this.props}/>
        </Modal>
      </div>
    );
  }
}
