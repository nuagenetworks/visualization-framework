import React from 'react';
import { connect } from 'react-redux';

import AppBar from 'material-ui/AppBar';
import MainMenu from './MainMenu.js';
import NavBarTitle from './NavBarTitle.js';
import UserMenu from './UserMenu.js';

import { Actions, ActionKeyStore } from './redux/actions';
import { ActionKeyStore as InterfaceActionKeyStore } from "./redux/actions";

import style from "./styles"


class NavBarView extends React.Component {
    render() {
        const {
            context,
        } = this.props;

        if (context && context.hasOwnProperty("fullScreen"))
            return (<div></div>);

        let navTitleBar = <NavBarTitle {...this.props}></NavBarTitle>;

        return (
            <div>
                <AppBar
                  className="appBar"
                  style={style.navBar}
                  title={navTitleBar}
                  onClick={this.props.onLeftIconButtonTouchTap}
                  iconElementRight={<UserMenu context={context}/>}
                  iconStyleRight={style.menuRight}
                />
                <MainMenu />
            </div>
        );
    }
}


const mapStateToProps = (state) => ({
    title: state.interface.get(ActionKeyStore.NAV_BAR_TITLE),
    titleIcon: state.interface.get(ActionKeyStore.NAV_BAR_TITLE_ICON),
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT)
});


const actionCreators = (dispatch) => ({
    onLeftIconButtonTouchTap: () => {
        dispatch(Actions.toggleMainMenu());
    }
 });


export default connect(mapStateToProps, actionCreators)(NavBarView);
