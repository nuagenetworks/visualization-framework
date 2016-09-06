import React from 'react';
import { connect } from 'react-redux';
import { push } from 'redux-router';

import Drawer from 'material-ui/Drawer';
import Subheader from 'material-ui/Subheader';
import {CardHeader} from 'material-ui/Card';
import { List, ListItem } from 'material-ui/List';

import { Actions, ActionKeyStore } from './redux/actions';
import {search} from '../utils/elasticsearch';
import {theme} from '../theme';

var style = {
    header: {
        textAlign: 'center',
    },
    nestedItems: {
        background: theme.palette.lightBlue,
        padding: 0,
    },
    nestedItem: {
        fontSize: "14px",
        paddingLeft: "16px"
    }
}

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
                <div style={style.header}>
                    <p>Visualization Framework</p>
                    <img src="favicon.ico" alt="icon" role="presentation" width="10%" height="10%" />
                </div>

                <Subheader>General</Subheader>
                <List>
                    <ListItem
                        primaryText="Dashboard"
                        onTouchTap={() => {this.props.goTo('/')}}
                        />
                    <ListItem
                        primaryText="Zoom"
                        onTouchTap={() => {this.props.goTo('/zoom')}}
                        />
                </List>

                <Subheader>Enterprises</Subheader>
                <List>
                    <ListItem
                        primaryText="Nokia"
                        onTouchTap={() => {this.props.goTo('/')}}
                        initiallyOpen={true}
                        primaryTogglesNestedList={false}
                        nestedItems={[
                            <div style={style.nestedItems}>
                                <Subheader>Domains</Subheader>
                                    {this.state.domains.map((domain) => {
                                        var domainURI = encodeURIComponent(domain.trim())
                                        return (<ListItem
                                                    key={domainURI}
                                                    primaryText={domain}
                                                    style={style.nestedItem}
                                                    onTouchTap={() => {this.props.goTo('/domains/' + domainURI)}}
                                                    />)
                                    })}

                                <Subheader>NSGs</Subheader>
                                <ListItem
                                    key={1}
                                    style={style.nestedItem}
                                    primaryText="NSG 1"
                                    />
                                <ListItem
                                    key={2}
                                    style={style.nestedItem}
                                    primaryText="NSG 2"
                                    />
                                <ListItem
                                    key={3}
                                    style={style.nestedItem}
                                    primaryText="NSG 3"
                                    />
                            </div>
                            ]}/>
                </List>
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
