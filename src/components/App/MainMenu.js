import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import Drawer from "material-ui/Drawer";
import Subheader from "material-ui/Subheader";
import { List, ListItem } from "material-ui/List";

import { Actions as ComponentActions, ActionKeyStore as ComponentActionKeyStore } from "./redux/actions";
import { ActionKeyStore as ServiceActionKeyStore } from "../../services/servicemanager/redux/actions";
import { theme } from "../../theme";

var style = {
    header: {
        textAlign: "center",
        color: "#ffffff",
    },
    nestedItems: {
        background: theme.palette.lightBlue,
        padding: 0,
    },
    nestedItem: {
        fontSize: "14px",
        paddingLeft: "16px",
        color: "#ffffff",
    },
    listItem: {
        color: "#ffffff",
    },
    subHeader: {
        color: "#ffffff",
    }
}

class MainMenuView extends React.Component {

    render() {
        return (
            <Drawer open={this.props.open} docked={false} onRequestChange={this.props.onRequestChange}>
                <div style={style.header}>
                    <p>Visualization Framework</p>
                    <img src="/src/favicon.ico" alt="icon" role="presentation" width="10%" height="10%" />
                </div>

                <Subheader style={style.subHeader}>General</Subheader>
                <List>
                    <ListItem
                        primaryText="Dashboard1"
                        onTouchTap={() => {this.props.goTo("/dashboards/dashboard1")}}
                        style={style.listItem}
                        />
                    <ListItem
                        primaryText="Dashboard2"
                        onTouchTap={() => {this.props.goTo("/dashboards/dashboard2")}}
                        style={style.listItem}
                        />
                </List>

                <Subheader style={style.subHeader}>Enterprises</Subheader>
                <List>
                    <ListItem
                        primaryText="Nokia"
                        initiallyOpen={true}
                        primaryTogglesNestedList={false}
                        style={style.listItem}
                        onTouchTap={() => {this.props.goTo("/enterprises/f0d5d98c-3f6b-469d-90bf-15bb9d4f0517")}}
                        nestedItems={[
                            // warning.js:36 Warning: Unknown prop `nestedLevel` on <div> tag. Remove this prop from the element
                            // See https://github.com/callemall/material-ui/issues/4602
                            <div key={0} style={style.nestedItems}>
                                <Subheader style={style.subHeader}>Domains</Subheader>
                                    {this.props.domains.map((domain) => {
                                        var domainURI = encodeURIComponent(domain.trim())
                                        return (<ListItem
                                                    key={domainURI}
                                                    primaryText={domain}
                                                    style={style.nestedItem}
                                                    onTouchTap={() => {this.props.goTo("/domains/" + domainURI)}}
                                                    />)
                                    })}

                                <Subheader style={style.subHeader}>NSGs</Subheader>
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
    open: state.interface.get(ComponentActionKeyStore.MAIN_MENU_OPENED),
    domains: state.services.getIn([ServiceActionKeyStore.REQUESTS, 'temporaryID', ServiceActionKeyStore.RESULTS]) || []
});

const actionCreators = (dispatch) => ({
  onRequestChange: function() {
      dispatch(ComponentActions.toggleMainMenu());
  },
  setPageTitle: function(aTitle) {
      dispatch(ComponentActions.updateTitle(aTitle));
  },
  goTo: function(link) {
      dispatch(ComponentActions.toggleMainMenu());
      dispatch(push(link));
  }
});


export default connect(mapStateToProps, actionCreators)(MainMenuView);
