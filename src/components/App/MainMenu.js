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

    initialize() {
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

        if (!domains)
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

        if (!nsgs)
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
        return (
            <Drawer open={this.props.open} docked={false} onRequestChange={this.props.onRequestChange} width={300}>
                <div style={style.menuLogo}>
                    <img src={ Logo } alt="Nuage Networks Visualization" />
                    <p>Visualizations</p>
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
  onRequestChange: React.PropTypes.func,
};

const mapStateToProps = (state) => ({
    open: state.interface.get(ComponentActionKeyStore.MAIN_MENU_OPENED),
    enterprises: state.services.getIn([ServiceActionKeyStore.REQUESTS, 'enterprises', ServiceActionKeyStore.RESULTS]),
    domains: state.services.getIn([ServiceActionKeyStore.REQUESTS, 'enterprises/54334da-6507-484e-8d5b-11d44c4a852e/domains', ServiceActionKeyStore.RESULTS]), // TODO: Only for dev
    nsgs: state.services.getIn([ServiceActionKeyStore.REQUESTS, 'enterprises/54334da-6507-484e-8d5b-11d44c4a852e/nsgateways', ServiceActionKeyStore.RESULTS]), // TODO: Only for dev
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
