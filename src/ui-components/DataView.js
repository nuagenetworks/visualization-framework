import React from 'react';
import PropTypes from 'prop-types';

import style from './style';
import { Icon } from '../ui-components';

const DataView = (props) => {
    const { children, data, height, isLoading, imagePlaceholder, name } = props;

    const dataViewStyle = {
        ...style.dataView,
        ...(isLoading ? style.loadingDataView : {}),
        ...(height ? { height } : {}),
    };

    return (
        <div style={dataViewStyle}>
            <Icon avatar={true} name={imagePlaceholder} />
            <div style={style.dataViewPrimaryText}>
                {data && (data.name || name)}
                {children && children(props)}
            </div>
        </div>
    );
};

DataView.defaultProps = {
    children: null,
    data: {},
    height: null,
    isLoading: false,
};

DataView.propTypes = {
    children: PropTypes.func,
    data: PropTypes.shape({}),
    height: PropTypes.number,
    imagePlaceholder: PropTypes.string.isRequired,
    isLoading: PropTypes.bool,
    name: PropTypes.string,
};

export default DataView;
