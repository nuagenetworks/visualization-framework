import React from 'react';
import { connect } from 'react-redux';

import AppBar from 'material-ui/AppBar';
import MainMenu from './MainMenu.js';

import { Actions, ActionKeyStore } from './redux/actions';


class NavBarView extends React.Component {
    render() {
        return (
            <div>
                <AppBar title={this.props.title} onLeftIconButtonTouchTap={this.props.onLeftIconButtonTouchTap} />
                <MainMenu />
            </div>
        );
    }
}


const mapStateToProps = (state) => ({
    title: state.interface.get(ActionKeyStore.NAV_BAR_TITLE)
});


const actionCreators = (dispatch) => ({
    onLeftIconButtonTouchTap: function() {
        dispatch(Actions.toggleMainMenu());
    },
    updateTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    }
 });


export default connect(mapStateToProps, actionCreators)(NavBarView);
