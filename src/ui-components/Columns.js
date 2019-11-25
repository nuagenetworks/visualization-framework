import React from 'react';
import PropTypes from 'prop-types';

const Columns = ({ children }) => (
    <div style={{ display: 'flex' }}>{children}</div>
);

Columns.propTypes = {
    children: PropTypes.node.isRequired,
};

const ColumnsColumn = ({ children, cover, width }) => {
    const columnWidth = width ? { width } : { flexGrow: cover * 1000 };
    return (
        <div style={{...columnWidth, marginTop: '10px'}}>{children}</div>
    );
}

ColumnsColumn.defaultProps = {
    children: null,
    cover: false,
    grow: null,
    width: null,
};

ColumnsColumn.propTypes = {
    children: PropTypes.node,
    cover: PropTypes.bool,
    width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

Columns.Column = ColumnsColumn;

export default Columns;
