import React from "react";
import PropTypes from "prop-types";

import { connect } from "react-redux";
import { push } from "react-router-redux";
import _ from 'lodash';

import Drawer from "material-ui/Drawer";
import Subheader from "material-ui/Subheader";
import { List, ListItem } from "material-ui/List";

import { ServiceManager } from "../../services/servicemanager/index";
import queryString from "query-string";
import {
    Actions as InterfaceActions,
    ActionKeyStore as InterfaceActionKeyStore
} from "./redux/actions";

import {
    Actions as ServiceActions,
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";

import {
    Actions as VSDActions
} from '../../configs/nuage/vsd/redux/actions';

import style from "./styles";
import Logo from "./logo.png";

class MainMenuView extends React.Component {

    componentWillMount() {
        this.initialize();
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { context: nextContext, ...nextRest } = nextProps;
        const { context, ...rest } = this.props;

        return (!_.isEqual(nextRest, rest))
            || (context.enterpriseID !== nextContext.enterpriseID);
    }

    componentWillReceiveProps(nextProps) {
        this.initialize();
    }

    initialize() {

        const {
            context,
            fetchDomainsIfNeeded,
            fetchEnterpriseIfNeeded,
            fetchL2DomainsIfNeeded,
            fetchNSGsIfNeeded,
            isConnected,
            visualizationType,
            fetchUserContextIfNeeded,
            updateUserContext
        } = this.props;

        if (!isConnected)
            return;

        if (!context.enterpriseID)
            return;

        fetchEnterpriseIfNeeded(context.enterpriseID).then((enterprises) => {
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

        fetchUserContextIfNeeded().then(userContexts => {
            if (_.isEmpty(userContexts))
                return;
            const userCtx = userContexts[0];
            if (userCtx) {
                updateUserContext(userCtx);
            }
        })
    }

    renderDomainsMenu() {
        const {
            context,
            domains,
            visualizationType
        } = this.props;

        if (!domains || domains.length === 0)
            return;

        const targetedDashboard = visualizationType === "VSS" ? "vssDomainFlow" : "aarDomain";
        const domainType = visualizationType === "VSS" ? "nuage_metadata.domainName" : "Domain";

        return (
            <div>
                {domains.map((domain) => {


                    let queryParams = Object.assign({}, context, { domainName: domain.name, domainType: domainType, domainID: domain.ID });

                    return (
                        <ListItem
                            key={domain.ID}
                            primaryText={domain.name}
                            style={style.nestedItem}
                            innerDivStyle={style.innerNestedItem}
                            onClick={() => { this.props.goTo(`${process.env.PUBLIC_URL}/dashboards/${targetedDashboard}`, queryParams) }}
                            leftIcon={
                                <img style={style.iconMenu} src={`${process.env.PUBLIC_URL}/icons/icon-domain.png`} alt="D" />
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

        const targetedDashboard = visualizationType === "VSS" ? "vssDomainFlow" : "aarDomain";
        const domainType = visualizationType === "VSS" ? "nuage_metadata.l2domainName" : "L2Domain";

        return (
            <div>
                {l2Domains.map((l2Domain) => {

                    let queryParams = Object.assign({}, context, { domainName: l2Domain.name, domainType: domainType, domainID: l2Domain.ID });
                    return (
                        <ListItem
                            key={l2Domain.ID}
                            primaryText={l2Domain.name}
                            style={style.nestedItem}
                            innerDivStyle={style.innerNestedItem}
                            onClick={() => { this.props.goTo(`${process.env.PUBLIC_URL}/dashboards/${targetedDashboard}`, queryParams) }}
                            leftIcon={
                                <img style={style.iconMenu} src={`${process.env.PUBLIC_URL}/icons/icon-l2domain.png`} alt="L2D" />
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

                    let queryParams = Object.assign({}, context, { snsg: nsg.name, dnsg: nsg.name, nsgId: nsg.ID });
                    return (
                        <ListItem
                            key={nsg.ID}
                            primaryText={nsg.name}
                            style={style.nestedItem}
                            innerDivStyle={style.innerNestedItem}
                            initiallyOpen={true}
                            open={true}
                            onClick={() => { this.props.goTo(`${process.env.PUBLIC_URL}/dashboards/aarNSG`, queryParams) }}
                            leftIcon={
                                <img style={style.iconMenu} src={`${process.env.PUBLIC_URL}/icons/icon-nsgateway.png`} alt="N" />
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
                            onClick={() => { this.props.goTo(`${process.env.PUBLIC_URL}/dashboards/${targetedDashboard}`, context) }}
                            nestedItems={[
                                <div key={"sub-enterprise" + enterprise.ID} style={style.nestedItems}>
                                    {this.renderDomainsMenu()}
                                    {this.renderL2DomainsMenu()}
                                    {this.renderNSGsMenu()}
                                </div>
                            ]}
                            leftIcon={
                                <img style={style.iconMenu} src={`${process.env.PUBLIC_URL}/icons/icon-enterprise.png`} alt="N" />
                            }
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
                    <img src={Logo} alt="Nuage Networks Visualization" />
                    <p>{visualizationType} Analytics</p>
                </div>

                <Subheader style={style.subHeader}>
                    ENTERPRISES
                    <span className="pull-right">
                        <img style={style.iconSubMenu} src={`${process.env.PUBLIC_URL}/icons/icon-enterprise.png`} alt="" />
                    </span>
                </Subheader>

                <List>
                    {this.renderEnterprisesMenu()}
                </List>
            </Drawer>
        );
    }
}


MainMenuView.propTypes = {
    open: PropTypes.bool,
    onRequestChange: PropTypes.func
};

const mapStateToProps = (state) => {
    const queryConfiguration = {
        service: "VSD",
        query: {
            parentResource: "enterprises",
        }
    };

    const props = {
        context: state.interface.get(InterfaceActionKeyStore.CONTEXT),
        visualizationType: state.interface.get(InterfaceActionKeyStore.VISUALIZATION_TYPE),
        open: state.interface.get(InterfaceActionKeyStore.MAIN_MENU_OPENED),
        isConnected: state.services.getIn([ServiceActionKeyStore.REQUESTS, ServiceManager.getRequestID(queryConfiguration), ServiceActionKeyStore.RESULTS]),
    };

    if (props.context && props.context.enterpriseID) {
        props.enterprises = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID, ServiceActionKeyStore.RESULTS]);
        props.domains = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/domains", ServiceActionKeyStore.RESULTS]);
        props.l2Domains = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/l2domains", ServiceActionKeyStore.RESULTS]);

        if (props.visualizationType === "AAR")
            props.nsgs = state.services.getIn([ServiceActionKeyStore.REQUESTS, "enterprises/" + props.context.enterpriseID + "/nsgateways", ServiceActionKeyStore.RESULTS]);
    }

    props.userContexts = state.services.getIn([ServiceActionKeyStore.REQUESTS, "usercontexts", ServiceActionKeyStore.RESULTS]);

    return props;

};

const actionCreators = (dispatch) => ({
    onRequestChange: () => {
        dispatch(InterfaceActions.toggleMainMenu());
    },

    goTo: function (link, context) {
        dispatch(push({ pathname: link, search: queryString.stringify(context)}));
    },

    fetchEnterpriseIfNeeded: (enterpriseID) => {
        let configuration = {
            service: "VSD",
            query: {
                parentResource: "enterprises",
                parentID: enterpriseID
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
        return dispatch(ServiceActions.fetchIfNeeded(configuration, {}, true));
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
        return dispatch(ServiceActions.fetchIfNeeded(configuration, {}, true));
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
        return dispatch(ServiceActions.fetchIfNeeded(configuration, {}, true));
    },

    fetchUserContextIfNeeded: () => {
        let configuration = {
            service: "VSD",
            query: {
                parentResource: "usercontexts",
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration, {}, true));
    },

    updateUserContext: (userContext) => {
        dispatch(VSDActions.updateUserContext(userContext))
    }
});


export default connect(mapStateToProps, actionCreators)(MainMenuView);
