import React, { Component } from 'react';
import PropTypes from 'prop-types';

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
            onSuccess,
            onDone,
            configuration,
        } = this.props;
        const { errors, success } = nextProps;

        if (errors && !oldErrors) {
            onError(configuration(), errors);
        }

        if (success) {
            onSuccess(configuration(), onDone);
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
            configuration,
        } = this.props;

        const handleSubmit = formData => onSubmit(formData, configuration());
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
    onDone: PropTypes.func,
    configuration: PropTypes.func.isRequired,
};

const mapStateToProps = (state, ownProps) => {
    const query = state.router.location.query;
    const { configuration } = ownProps;
    const errors = getServerErrors(state, configuration());
    return {
        query,
        errors,
        success: isSubmitSuccessfull(state, configuration()),
    };
}

export default connect(mapStateToProps, {
    onSubmit: formSubmit,
    validate: entityValidation,
    onError: submitFailure,
    onSuccess: submitSuccess,
})(Editor);
