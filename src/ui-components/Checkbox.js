import React from 'react';
import PropTypes from 'prop-types';

import inputHOC from './inputHOC';
import style from './style';

const Checkbox = ({ label, value, onChange, id }) => {
    let checkbox;

    return (
        <div style={style.checkboxContainer}>
            <input
                id={`checkbox-${id}`}
                style={style.realCheckbox}
                ref={(el) => { if (el) checkbox = el; }}
                type="checkbox"
                checked={!!value}
                onChange={onChange}
            />
            <button
                id={id}
                type="button"
                style={value ? style.checkboxChecked : style.checkboxUnchecked}
                onClick={() => checkbox.click()}
            />
            <label htmlFor={`checkbox-${id}`}>{label}</label>
        </div>
    );
};

Checkbox.defaultProps = {
    action: null,
    input: undefined,
    label: '',
    type: 'text',
    value: undefined,
    onChange() {},
};

Checkbox.propTypes = {
    label: PropTypes.string,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
    onChange: PropTypes.func,
};

export default inputHOC(Checkbox);
