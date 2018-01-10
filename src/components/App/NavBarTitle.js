import React from 'react';
import style from "./styles";

class NavBarTitleView extends React.Component {
    render() {
        const {
            context,
            title,
            titleIcon
        } = this.props;

        if (context && context.hasOwnProperty("fullScreen"))
            return (<div></div>);

        let icon = (titleIcon) ? <img style={style.iconNavBarMenu} src={`${process.env.PUBLIC_URL}/icons/icon-${titleIcon}.png`} alt="" /> : '';

        return (
            <div>
                {icon} {title}
            </div>
        );
    }
}

export default NavBarTitleView;
