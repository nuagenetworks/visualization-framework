import React, { PropTypes } from 'react';
import style from './style';

const Label = ({ children }) => <p style={style.label}>{children}</p>;
Label.defaultProps = { children: null };
Label.propTypes = { children: PropTypes.node };
export default Label;
