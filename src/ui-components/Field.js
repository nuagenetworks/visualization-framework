import React from 'react';
import PropTypes from 'prop-types';

import style from './style';

const Field = props => {
    const { action, autoFocus, error, label, type, value, onChange, meta, id } = props;
    let errorInfo = undefined;
    //this is a server error coming from the store
    if (error) {
        errorInfo = error.descriptions.map(({ description }) => description).join('\n');
    }
    // this is a field client side validation error
    else if (meta && meta.touched && meta.error) {
        errorInfo = meta.error;
    }

    const fieldWrapper = errorInfo ? style.errorField : style.fieldWrapper;

    const input = (
        <input
            id={id}
            action={action}
            value={value}
            type={type}
            placeholder={label}
            onChange={onChange}
            ref={(el) => { if (autoFocus && el) el.focus(); }}
            style={style.field}
        />
    );

    const errorSpan = errorInfo ? <span style={style.errorSpan}>{errorInfo}</span> : null;

    return (
        <div>
            <div style={fieldWrapper}>
                {input}
            </div>
            {errorSpan}
        </div>
    );
};

Field.defaultProps = {
    action: null,
    autoFocus: false,
    error: null,
    label: '',
    type: 'text',
    value: undefined,
    onChange() {},
};

Field.propTypes = {
    action: PropTypes.shape({
        onClick: PropTypes.func,
    }),
    autoFocus: PropTypes.bool,
    error: PropTypes.shape({ property: PropTypes.string, descriptions: PropTypes.array }),
    label: PropTypes.string,
    type: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    onChange: PropTypes.func,
};

export default Field;
