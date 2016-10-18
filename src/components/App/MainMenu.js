import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import Drawer from "material-ui/Drawer";
import Subheader from "material-ui/Subheader";
import { List, ListItem } from "material-ui/List";

import {
    Actions as ComponentActions,
    ActionKeyStore as ComponentActionKeyStore
} from "./redux/actions";

import {
    Actions as ServiceActions,
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";

import style from "./styles"
import Logo from "./logo.png"



class MainMenuView extends React.Component {

    componentWillMount() {
        this.initialize();
    }

    componentWillReceiveProps(nextProps) {
        this.initialize();
    }

    initialize() {
        this.props.fetchEnterprisesIfNeeded().then((enterprises) => {
            // if (!enterprises)
            //     return;
            //
            // for (let index in enterprises) { // eslint-disable-line
            //     let enterprise = enterprises[index];
            //     this.props.fetchDomainsIfNeeded(enterprise.ID);
            // }
        });
    }

    renderSubTree() {
        const { enterprises } = this.props;

        if (!enterprises)
            return;

        return (
            <div>
                {enterprises.map((enterprise) => {
                    return (
                        <ListItem
                            key={enterprise.ID}
                            primaryText={enterprise.name}
                            style={style.listItem}
                        />
                    )
                })}
            </div>
        )
    }

    render() {
        return (
            <Drawer open={this.props.open} docked={false} onRequestChange={this.props.onRequestChange}>
                <div style={style.menuLogo}>
                    <img src={Logo} alt="Visualization Framework by Nuage Networks" />
                    <p>Visualizations</p>
                </div>

                <Subheader style={style.subHeader}>DEVELOPMENT</Subheader>
                <List>
                    <ListItem
                        primaryText="AppsOverview"
                        onTouchTap={() => {this.props.goTo("/dashboards/appsOverview?startTime=now-900h")}}
                        style={style.listItem}
                        />
                    <ListItem
                        primaryText="App Aware Routing"
                        onTouchTap={() => {this.props.goTo("/dashboards/aarEnterprise?startTime=now-900h")}}
                        style={style.listItem}
                        />
                    <ListItem
                        primaryText="AAR-Enterprise-App-List"
                        onTouchTap={() => {this.props.goTo("/dashboards/aarEnterpriseAppList?startTime=now-900h")}}
                        style={style.listItem}
                        />
                    <ListItem
                        primaryText="AAR-Domain"
                        onTouchTap={() => {this.props.goTo("/dashboards/aarDomain?startTime=now-900h")}}
                        style={style.listItem}
                        />
                    <ListItem
                        primaryText="VSS-Enterprise"
                        onTouchTap={() => {this.props.goTo("/dashboards/vssEnterprise?startTime=now-900h")}}
                        style={style.listItem}
                        />
                    <ListItem
                        primaryText="VSS-Domain"
                        onTouchTap={() => {this.props.goTo("/dashboards/vssDomainTraffic1?startTime=now-900h")}}
                        style={style.listItem}
                        />
                    <ListItem
                        primaryText="VSS-Domain-Event"
                        onTouchTap={() => {this.props.goTo("/dashboards/vssDomainEvent?startTime=now-900h")}}
                        style={style.listItem}
                        />
                </List>

                <Subheader style={style.subHeader}>ENTERPRISES</Subheader>
                <List>
                    {this.renderSubTree()}
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
    enterprises: state.services.getIn([ServiceActionKeyStore.REQUESTS, 'enterprises', ServiceActionKeyStore.RESULTS]),
});

const actionCreators = (dispatch) => ({
  onRequestChange: () => {
      dispatch(ComponentActions.toggleMainMenu());
  },
  setPageTitle: (aTitle) => {
      dispatch(ComponentActions.updateTitle(aTitle));
  },
  goTo: (link) => {
      dispatch(ComponentActions.toggleMainMenu());
      dispatch(push(link));
  },
  fetchEnterprisesIfNeeded: () => {
      let configuration = {
          service: "VSD",
          query: {
              parentResource: "enterprises",
          }
      }
      return dispatch(ServiceActions.fetchIfNeeded(configuration));
  }
});


export default connect(mapStateToProps, actionCreators)(MainMenuView);
