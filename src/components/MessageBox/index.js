import React from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";

import { ActionKeyStore, Actions } from "./redux/actions";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";


class MessageBoxView extends React.Component {

    render() {
        const buttons = [
            <FlatButton
                label="OK"
                primary={false}
                onClick={this.props.close}
                />,
        ];

        return (
            <Dialog
                title={this.props.title}
                actions={buttons}
                open={this.props.opened}
                onRequestClose={this.props.close}
                style={{zIndex: 10000}}
                >
                {this.props.body}
            </Dialog>
        );
    }
}

MessageBoxView.propTypes = {
    opened: PropTypes.bool,
    title: PropTypes.string,
    body: PropTypes.node,
};

const mapStateToProps = (state) => ({
    opened: state.messageBox.get(ActionKeyStore.MESSAGE_BOX_OPENED),
    title: state.messageBox.get(ActionKeyStore.MESSAGE_BOX_TITLE),
    body: state.messageBox.get(ActionKeyStore.MESSAGE_BOX_BODY),
    buttons: state.messageBox.get(ActionKeyStore.MESSAGE_BOX_BUTTONS),
});


const actionCreators = (dispatch) => ({
    close: () => {
      dispatch(Actions.toggleMessageBox(false));
    },
 });


export default connect(mapStateToProps, actionCreators)(MessageBoxView);
