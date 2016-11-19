import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import Drawer from "material-ui/Drawer";
import Subheader from "material-ui/Subheader";
import { List, ListItem } from "material-ui/List";

import { ServiceManager } from "../../services/servicemanager/index";

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


class MainMenuView extends React.Component {

    componentWillMount() {
        this.initialize();
    }

    componentWillReceiveProps(nextProps) {
        this.initialize();
    }

    initialize() {

        const {
            fetchDomainsIfNeeded,
            fetchEnterprisesIfNeeded,
            fetchL2DomainsIfNeeded,
            fetchNSGsIfNeeded,
            licenses,
            visualizationType
        } = this.props;

        if (!licenses || !licenses.length)
            return;

        fetchEnterprisesIfNeeded().then((enterprises) => {
            if (!enterprises)
                return;

            for (let index in enterprises) { // eslint-disable-line
                let enterprise = enterprises[index];
                fetchDomainsIfNeeded(enterprise.ID);
                fetchL2DomainsIfNeeded(enterprise.ID);

                if (visualizationType === "AAR")
                    fetchNSGsIfNeeded(enterprise.ID);
            }
        });
    }

    renderDomainsMenu() {
        const {
            context,
            domains,
            visualizationType
        } = this.props;

        if (!domains || domains.length === 0)
            return;

        const targetedDashboard = visualizationType === "VSS" ? "vssDomainACL" : "aarDomain";

        return (
            <div>
                {domains.map((domain) => {
                    return (
                        <ListItem
                            key={domain.ID}
                            primaryText={domain.name}
                            style={style.nestedItem}
                            innerDivStyle={style.innerNestedItem}
                            onTouchTap={() => { this.props.goTo(process.env.PUBLIC_URL + "/dashboards/" + targetedDashboard, context)}}
                            leftIcon={
                                <img style={style.iconMenu} src={process.env.PUBLIC_URL + "/icons/icon-domain.png"} alt="D" />
                            }
                        />
                    )
                })}
            </div>
        )
    }

    renderL2DomainsMenu() {
        const {
            context,
            l2Domains,
            visualizationType
        } = this.props;

        if (!l2Domains || l2Domains.length === 0)
            return;

        const targetedDashboard = visualizationType === "VSS" ? "vssL2DomainACL" : "aarL2Domain";

        return (
            <div>
                {l2Domains.map((l2Domain) => {
                    return (
                        <ListItem
                            key={l2Domain.ID}
                            primaryText={l2Domain.name}
                            style={style.nestedItem}
                            innerDivStyle={style.innerNestedItem}
                            onTouchTap={() => { this.props.goTo(process.env.PUBLIC_URL + "/dashboards/" + targetedDashboard, context)}}
                            leftIcon={
                                <img style={style.iconMenu} src={process.env.PUBLIC_URL + "/icons/icon-l2domain.png"} alt="L2D" />
                            }
                        />
                    )
                })}
            </div>
        )
    }

    renderNSGsMenu() {
        const {
            context,
            nsgs,
        } = this.props;

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
                            initiallyOpen={true}
                            open={true}
                            onTouchTap={() => { this.props.goTo(process.env.PUBLIC_URL + "/dashboards/aarNSG", context)}}
                            leftIcon={
                                <img style={style.iconMenu} src={process.env.PUBLIC_URL + "/icons/icon-nsgateway.png"} alt="N" />
                            }
                        />
                    )
                })}
            </div>
        )
    }

    renderEnterprisesMenu() {
        const {
            context,
            enterprises,
            visualizationType
        } = this.props;

        if (!enterprises)
            return;

        const targetedDashboard = visualizationType === "VSS" ? "vssEnterprise" : "aarEnterprise";

        return (
            <div>
                {enterprises.map((enterprise) => {
                    return (
                        <ListItem
                            key={enterprise.ID}
                            primaryText={enterprise.name}
                            style={style.listItem}
                            onTouchTap={() => { this.props.goTo(process.env.PUBLIC_URL + "/dashboards/" + targetedDashboard, context)}}
                            nestedItems={[
                                <div style={style.nestedItems}>
                                    {this.renderDomainsMenu()}
                                    {this.renderL2DomainsMenu()}
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
    const queryConfiguration = {
        service: "VSD",
        query: {
            parentResource: "licenses",
        }
    };

    const props = {
        context: state.interface.get(ComponentActionKeyStore.CONTEXT),
        visualizationType: state.interface.get(ComponentActionKeyStore.VISUALIZATION_TYPE),
        open: state.interface.get(ComponentActionKeyStore.MAIN_MENU_OPENED),
        enterprises: state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises", ServiceActionKeyStore.RESULTS]),
        licenses: state.services.getIn([ServiceActionKeyStore.REQUESTS, ServiceManager.getRequestID(queryConfiguration), ServiceActionKeyStore.RESULTS]) || [],
    };

    if (props.context && props.context.enterpriseID) {
        props.domains = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/domains", ServiceActionKeyStore.RESULTS]);
        props.l2Domains = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/l2domains", ServiceActionKeyStore.RESULTS]);

        if (props.visualizationType === "AAR")
            props.nsgs = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/nsgateways", ServiceActionKeyStore.RESULTS]);
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

    fetchL2DomainsIfNeeded: (enterpriseID) => {
        let configuration = {
            service: "VSD",
            query: {
                parentResource: "enterprises",
                parentID: enterpriseID,
            resource: "l2domains"
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
