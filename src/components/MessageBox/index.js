import React from "react";
import { connect } from "react-redux";

import { ActionKeyStore, MessageBoxActions } from "./redux/actions";

import Dialog from "material-ui/Dialog";
import FlatButton from "material-ui/FlatButton";


class MessageBoxView extends React.Component {

    render() {
        const buttons = [
            <FlatButton
                label="OK"
                primary={false}
                onTouchTap={this.props.close}
                />,
        ];

        return (
            <Dialog
                title={this.props.title}
                actions={buttons}
                open={this.props.opened}
                onRequestClose={this.props.close}
                >
                {this.props.body}
            </Dialog>
        );
    }
}

MessageBoxView.propTypes = {
    opened: React.PropTypes.bool,
    title: React.PropTypes.string,
    body: React.PropTypes.string,
};

const mapStateToProps = (state) => ({
    opened: state.messageBox.get(ActionKeyStore.KEY_STORE_MESSAGE_BOX_OPENED),
    title: state.messageBox.get(ActionKeyStore.KEY_STORE_MESSAGE_BOX_TITLE),
    body: state.messageBox.get(ActionKeyStore.KEY_STORE_MESSAGE_BOX_BODY),
    buttons: state.messageBox.get(ActionKeyStore.KEY_STORE_MESSAGE_BOX_BUTTONS),
});


const actionCreators = (dispatch) => ({
    close: () => {
      dispatch(MessageBoxActions.toggleMessageBox(false));
    },
 });


export default connect(mapStateToProps, actionCreators)(MessageBoxView);
