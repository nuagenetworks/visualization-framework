import React from 'react';
import PropTypes from 'prop-types';

import { Field, reduxForm } from 'redux-form';
import TextInput from './TextInput';

const FormField = props => (
    <div className="field">
        <Field
            id={props.name}
            component={props.component}
            {...props}
        />
    </div>
);

FormField.defaultProps = {
    component: TextInput,
};

FormField.propTypes = {
    component: PropTypes.func,
    name: PropTypes.string.isRequired,
};

const WrappedForm = props => {
    const {handleSubmit, invalid, submitting, children, error, rest} = props;
    return(
        <form onSubmit={handleSubmit} disabled={invalid || submitting} {...rest} >
            { children }
            {error && <strong>{error}</strong>}
        </form>
    )
};

class Form extends React.Component {
    componentWillMount() {
        const { children, name, initialValues, validate, onSubmit, fields, ...rest } = this.props;

        this.ReduxFormWrapper = reduxForm({
            form: name,
            initialValues,
            onSubmit,
            validate,
            fields,
            children,
            rest
        })(WrappedForm);
    }

    render() {
        return <this.ReduxFormWrapper children={this.props.children}/>;
    }
}

Form.defaultProps = {
    children: null,
    initialValues: {},
    validate: {},
    fields:[],
};

Form.propTypes = {
    children: PropTypes.node,
    initialValues: PropTypes.shape({}),
    name: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    validate: PropTypes.func,
    fields: PropTypes.arrayOf(PropTypes.string),
};

Form.Field = FormField;

export default Form;
