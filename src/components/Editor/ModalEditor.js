import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import { FlatButton } from 'material-ui';
import { formSubmit, clickSubmit } from './actions';
import style from './style';
import { Modal } from '../../ui-components';
import componentStyle  from '../../ui-components/style';
import Editor from '.';

export const ModalEditor = props => {
    let {
        name,
        children,
        onCancel,
        title,
        width,
        open,
        submitLabel,
        handleClick,
        errored,
        onDone,
    } = props;
    const buttonFlat = componentStyle.buttonFlat;
    let buttons = [
        <FlatButton
            primary={true}
            onTouchTap={() => handleClick(name)}
            disabled={errored}
            style={buttonFlat}
        >{submitLabel}</FlatButton>,
        <FlatButton
            primary={false}
            onTouchTap={onCancel}
            style={buttonFlat}
        >Cancel</FlatButton>,
    ];

    return (
        <Modal
            actions={buttons}
            open={open}
            onClose={onCancel}
            title={title}
            width={width}
        >
            <div style={style.modalEditorContainer}>
                <Editor {...props} onDone={onDone}>
                    {children}
                </Editor>
            </div>
        </Modal>
    );
};

ModalEditor.defaultProps = {
    children: null,
};

ModalEditor.propTypes = {
    children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
    onCancel: PropTypes.func.isRequired,
};

const mapStateToProps = (state) => ({
    query: state.router.location.query,
})

export default connect(mapStateToProps, {
    handleSubmit: formSubmit,
    handleClick: clickSubmit,
})(ModalEditor);
