import React from 'react';
import { Icon } from '.';
import style from './style';

const Button = (props) => {
    const {
        active,
        icon,
        children,
        disabled,
        flat,
        primary,
        size,
        onClick
    } = props;

    if (flat) {
        return icon ? (
            <button onClick={onClick} style={style.buttonFlatIcon} type="button">
                <Icon name={icon} active={active} size={size} />
            </button>
        ) : (
            <button
                style={Object.assign({}, style.buttonFlat, active ? style.buttonActive : {})}
                onClick={onClick}
            >
                {children}
            </button>
        );
    }

    if (icon) {
        return (
            <button style={style.buttonIcon} onClick={onClick}>
                <Icon name={icon} size={size} />
            </button>
        );
    }

    let buttonStyle;
    if (disabled) {
        buttonStyle = style.disabledButton;
    } else if (primary) {
        buttonStyle = style.primaryButton;
    } else {
        buttonStyle = style.button;
    }
    return (
        <button
            disabled={disabled}
            onClick={onClick}
            style={buttonStyle}
        >
            {children}
        </button>
    );
}

export default Button;
