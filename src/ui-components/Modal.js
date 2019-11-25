import React from 'react';
import PropTypes from 'prop-types';

import Dialog from "material-ui/Dialog";
import style from "./style";


const Modal = ({ actions, children, open, small, title, onClose, width }) => {
        const contentStyle = small ? { width: 250 } : width ? { width } : {};
        contentStyle.maxWidth = '100%';
        return (
            <Dialog
                actions={actions}
                actionsContainerStyle={style.modalActions}
                autoScrollBodyContent
                bodyStyle={style.modal}
                contentStyle={contentStyle}
                onRequestClose={onClose}
                open={open}
                title={title}
            >
                {children}
            </Dialog>
        );
}

Modal.defaultProps = {
    actions: null,
    children: null,
    defaultOpen: undefined,
    open: undefined,
    small: false,
    title: null,
    onClose() {},
    onOpen() {},
    width: '45%'
};

Modal.propTypes = {
    actions: PropTypes.node,
    children: PropTypes.node,
    open: PropTypes.bool,
    small: PropTypes.bool,
    title: PropTypes.node,
    onClose: PropTypes.func,
};

export default Modal;
