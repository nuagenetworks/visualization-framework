import React from 'react';
import PropTypes from 'prop-types';

import ViewContent from './ViewContent';
import style from './style';

export const View = function View(props) {
    const { children, defaultWidth } = props;

    const contentWidth = `calc(100% - ${!children ? defaultWidth : 0}px)`;

    return (
        <div style={style.viewWrapper}>
            <div style={style.viewContent}>
                <ViewContent {...props} />
                {children}
            </div>
        </div>
    );
};

View.defaultProps = {
    children: null,
    defaultWidth: 210,
    hasSubModule: false,
    withSlider: false,
};

View.propTypes = {
    children: PropTypes.node,
    defaultWidth: PropTypes.number,
    hasSubModule: PropTypes.bool,
    withSlider: PropTypes.bool,
};

export default View;
