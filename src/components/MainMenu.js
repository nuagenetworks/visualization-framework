import React from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';

import Drawer from 'material-ui/Drawer';
import MenuItem from 'material-ui/MenuItem';

import { Actions, ActionKeyStore } from './redux/actions';
import {search} from '../utils/elasticsearch';


class MainMenuView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            domains: []
        };
    };

    componentWillMount() {
        let view = this;

        search({
            q: 'domains',
        }).then(function () {
            view.setState({domains: ['domain 1', 'domain 2', 'domain 3']});
            console.error('ElasticSearch is UP !');

        }, function () {
            view.setState({domains: []});
            console.error('ElasticSearch cluster is down!');
        });
    }

    render() {
        return (
            <Drawer open={this.props.open} docked={false} onRequestChange={this.props.onRequestChange}>
                <MenuItem onTouchTap={() => {this.props.goTo('/')}}>Dashboard</MenuItem>
                <MenuItem onTouchTap={() => {this.props.goTo('/zoom')}}>Zoom</MenuItem>

                {this.state.domains.map((domain) => {
                    var domainURI = encodeURIComponent(domain.trim())
                    return (<MenuItem key={domainURI} onTouchTap={() => {this.props.goTo('/domains/' + domainURI)}}>{domain}</MenuItem>)
                })}
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
