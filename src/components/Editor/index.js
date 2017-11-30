import React, { Component, PropTypes } from 'react';
import { connect } from 'react-redux';
import Form from '../../ui-components/Form';
import style from './style';
import { formSubmit, entityValidation, submitFailure, submitSuccess } from './actions';
import { getServerErrors, isSubmitSuccessfull } from './utils';

class Editor extends Component {
    componentWillReceiveProps(nextProps) {
        const {
            errors: oldErrors,
            onError,
            parent,
            resourceName,
            onSuccess,
            onDone,
        } = this.props;
        const { errors, success } = nextProps;

        if (errors && !oldErrors) {
            onError(parent, resourceName, errors);
        }

        if (success) {
            onSuccess(parent, resourceName, onDone);
        }
    }
    render() {
        let {
            name,
            children,
            getInitialValues,
            onSubmit,
            validate,
            onValidate,
            parent,
            resourceName,
        } = this.props;

        const handleSubmit = formData => onSubmit(formData, parent, resourceName);
        const formValidation = values => validate(values, onValidate);

        return (
                <Form
                    name={name}
                    initialValues={{
                        ...getInitialValues(this.props),
                    }}
                    onSubmit={handleSubmit}
                    style={style.wrapper}
                    validate={formValidation}
                >
                    <div style={style.editor}>
                        {children}
                    </div>
                </Form>
        );
    }
}

Editor.defaultProps = {
    getInitialValues: () => ({}),
    onValidate: () => ({}),
    onDone: () => ({}),
};

Editor.propTypes = {
    children: PropTypes.node.isRequired,
    getInitialValues: PropTypes.func,
    onSubmit: PropTypes.func.isRequired,
    onValidate: PropTypes.func.isRequired,
    parent: PropTypes.shape({}).isRequired,
    resourceName: PropTypes.string.isRequired,
    onDone: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const query = state.router.location.query;
    const { parent, resourceName } = ownProps;
    const errors = getServerErrors(state, parent, resourceName);
    return {
        query,
        errors,
        success: isSubmitSuccessfull(state, parent, resourceName),
    };
}

export default connect(mapStateToProps, {
    onSubmit: formSubmit,
    validate: entityValidation,
    onError: submitFailure,
    onSuccess: submitSuccess,
})(Editor);
