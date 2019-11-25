import React from 'react';
import PropTypes from 'prop-types';

const Icon = ({ name, size, avatar }) => {
    const style = avatar ? { borderRadius: 3, height: size, width: size } : { height: size };
    return (
        <img
            alt={name}
            src={`${process.env.PUBLIC_URL}/icons/${name}.png`}
            style={style}
        />
    );
}

Icon.defaultProps = {
    size: undefined,
};

Icon.propTypes = {
    name: PropTypes.string.isRequired,
    size: PropTypes.number,
};

export default Icon;
