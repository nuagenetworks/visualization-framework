import React from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import { Actions, ActionKeyStore } from './redux/actions';


class MainMenuView extends React.Component {

    render() {
        return (
            <Drawer open={this.props.open} docked={false} onRequestChange={this.props.onRequestChange}>
                <MenuItem onTouchTap={() => {this.props.goTo('/')}}>Dashboard</MenuItem>
                <MenuItem onTouchTap={() => {this.props.goTo('/zoom')}}>Zoom</MenuItem>
            </Drawer>
        );
    }
}


MainMenuView.propTypes = {
  open: React.PropTypes.bool,
  onRequestChange: React.PropTypes.func,
};


const mapStateToProps = (state) => ({
  open: state.interface.get(ActionKeyStore.KEY_STORE_MAIN_MENU_OPENED),
});


const actionCreators = (dispatch) => ({
  onRequestChange: function() {
      dispatch(Actions.toggleMainMenu());
  },
  setPageTitle: function(aTitle) {
      dispatch(Actions.updateTitle(aTitle));
  },
  goTo: function(link) {
      dispatch(Actions.toggleMainMenu());
      dispatch(push(link));
  }
});


export default connect(mapStateToProps, actionCreators)(MainMenuView);
