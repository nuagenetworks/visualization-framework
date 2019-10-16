import React from 'react';
import PropTypes from 'prop-types';

export default (Component) => {
    const Input = (props) => {
        const { input, value, onChange, label, ...rest } = props;

        const content = (
            <Component
                label={label}
                value={input ? input.value : value}
                onChange={input ? input.onChange : onChange}
                {...rest}
            />
        );

        return content;
    };

    Input.defaultProps = {
        input: undefined,
        value: undefined,
        label: null,
        onChange() {},
    };

    Input.propTypes = {
        input: PropTypes.shape({
            value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number]),
            onChange: PropTypes.func,
        }),
        label: PropTypes.string,
        value: PropTypes.oneOfType([PropTypes.string, PropTypes.bool, PropTypes.number, PropTypes.array, PropTypes.object]),
        onChange: PropTypes.func,
    };

    return Input;
};
