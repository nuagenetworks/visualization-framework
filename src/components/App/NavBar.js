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

        var title = this.props.title;

        if(this.props.links) {
            title = '';
        }

        if (context && context.hasOwnProperty("fullScreen"))
            return (<div></div>);

        return (
            <div>
                <AppBar className="appBar" style={style.navBar} title={title} onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap} />
                <MainMenu />
            </div>
        );
    }
}


const mapStateToProps = (state) => ({
    title: state.interface.get(ActionKeyStore.NAV_BAR_TITLE),
    context: state.interface.get(InterfaceActionKeyStore.CONTEXT),
    links: state.interface.get(ActionKeyStore.LINKS),
});


const actionCreators = (dispatch) => ({
    onLeftIconButtonTouchTap: () => {
        dispatch(Actions.toggleMainMenu());
    }
 });


export default connect(mapStateToProps, actionCreators)(NavBarView);
