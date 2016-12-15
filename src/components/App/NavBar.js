import React from 'react';
import { connect } from 'react-redux';

import AppBar from 'material-ui/AppBar';
import MainMenu from './MainMenu.js';

import { Actions, ActionKeyStore } from './redux/actions';
import { ActionKeyStore as InterfaceActionKeyStore } from "./redux/actions";

import style from "./styles"


class NavBarView extends React.Component {
    render() {
        const {
            context
        } = this.props;

        if (context && context.hasOwnProperty('full'))
            return (<div></div>);

        return (
            <div>
                <AppBar className="appBar" style={style.navBar} title={this.props.title} onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap} />
                <MainMenu />
            </div>
        );
    }
}


const mapStateToProps = (state) => ({
    title: state.interface.get(ActionKeyStore.NAV_BAR_TITLE),
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT),
});


const actionCreators = (dispatch) => ({
    onLeftIconButtonTouchTap: () => {
        dispatch(Actions.toggleMainMenu());
    },
    updateTitle: (aTitle) => {
        dispatch(Actions.updateTitle(aTitle));
    }
 });


export default connect(mapStateToProps, actionCreators)(NavBarView);
