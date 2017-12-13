import React, { PropTypes } from 'react';
import style from './style';

const Header = ({ children }) => <p style={style.header}><b>{children}</b></p>
Header.defaultProps = { children: null };
Header.propTypes = { children: PropTypes.node };
export default Header;
