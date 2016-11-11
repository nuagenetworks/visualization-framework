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

import style from "./styles";
import Logo from "./logo.png";
import FontAwesome from "react-fontawesome";


class MainMenuView extends React.Component {

    componentWillMount() {
        this.initialize();
    }

    componentWillReceiveProps(nextProps) {
        this.initialize();
    }

    initialize() {;
        this.props.fetchEnterprisesIfNeeded().then((enterprises) => {
            if (!enterprises)
                return;

            for (let index in enterprises) { // eslint-disable-line
                let enterprise = enterprises[index];
                this.props.fetchDomainsIfNeeded(enterprise.ID);
                this.props.fetchNSGsIfNeeded(enterprise.ID);
            }
        });
    }

    renderDomainsMenu() {
        const { domains } = this.props;

        if (!domains || domains.length === 0)
            return;

        return (
            <div>
                {domains.map((domain) => {
                    return (
                        <ListItem
                            key={domain.ID}
                            primaryText={domain.name}
                            style={style.nestedItem}
                            innerDivStyle={style.innerNestedItem}
                            onTouchTap={() => { this.props.goTo("/dashboards/kitchenSink", {startTime:"now-900h"})}}
                            leftIcon={
                                <FontAwesome
                                    name="plane"
                                    style={style.iconMenu}
                                    />
                            }
                            />
                    )
                })}
            </div>
        )
    }

    renderNSGsMenu() {
        const { nsgs } = this.props;

        if (!nsgs || nsgs.length === 0)
            return;

        return (
            <div>
                {nsgs.map((nsg) => {
                    return (
                        <ListItem
                            key={nsg.ID}
                            primaryText={nsg.name}
                            style={style.nestedItem}
                            innerDivStyle={style.innerNestedItem}
                            onTouchTap={() => { this.props.goTo("/dashboards/kitchenSink", {startTime:"now-900h"})}}
                            leftIcon={
                                <FontAwesome
                                    name="inbox"
                                    style={style.iconMenu}
                                    />
                            }
                            />
                    )
                })}
            </div>
        )
    }

    renderEnterprisesMenu() {
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
                            onTouchTap={() => { this.props.goTo("/dashboards/kitchenSink", {startTime:"now-900h"})}}
                            nestedItems={[
                                <div style={style.nestedItems}>
                                    {this.renderDomainsMenu()}
                                    {this.renderNSGsMenu()}
                                </div>
                            ]}
                        />
                    )
                })}
            </div>
        )
    }

    render() {
        const {
            visualizationType,
        } = this.props;

        return (
            <Drawer open={this.props.open} docked={false} onRequestChange={this.props.onRequestChange} width={300}>
                <div style={style.menuLogo}>
                    <img src={ Logo } alt="Nuage Networks Visualization" />
                    <p>{visualizationType} Visualizations</p>
                </div>

                <Subheader style={style.subHeader}>ENTERPRISES</Subheader>
                <List>
                    {this.renderEnterprisesMenu()}
                </List>
            </Drawer>
        );
    }
}


MainMenuView.propTypes = {
  open: React.PropTypes.bool,
  onRequestChange: React.PropTypes.func
};

const mapStateToProps = (state) => {

    const props = {
        context: state.interface.get(ComponentActionKeyStore.CONTEXT),
        visualizationType: state.interface.get(ComponentActionKeyStore.VISUALIZATION_TYPE),
        open: state.interface.get(ComponentActionKeyStore.MAIN_MENU_OPENED),
        enterprises: state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises", ServiceActionKeyStore.RESULTS]),
    };

    if (props.context && props.context.enterpriseID) {
        props.domains = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/domains", ServiceActionKeyStore.RESULTS]);
        props.nsgs    = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/nsgateways", ServiceActionKeyStore.RESULTS]);
    }

    return props;

};

const actionCreators = (dispatch) => ({
    onRequestChange: () => {
      dispatch(ComponentActions.toggleMainMenu());
    },

    setPageTitle: (aTitle) => {
      dispatch(ComponentActions.updateTitle(aTitle));
    },

    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    },

    fetchEnterprisesIfNeeded: () => {
      let configuration = {
          service: "VSD",
          query: {
              parentResource: "enterprises",
          }
      }
      return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },

    fetchDomainsIfNeeded: (enterpriseID) => {
        let configuration = {
            service: "VSD",
            query: {
                parentResource: "enterprises",
                parentID: enterpriseID,
            resource: "domains"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },

    fetchNSGsIfNeeded: (enterpriseID) => {
        let configuration = {
            service: "VSD",
            query: {
                parentResource: "enterprises",
                parentID: enterpriseID,
            resource: "nsgateways"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    }
});


export default connect(mapStateToProps, actionCreators)(MainMenuView);
