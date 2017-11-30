import { push } from 'redux-router';
import { change } from 'redux-form';
import { ServiceManager } from "../../services/servicemanager";
import { selectFieldValues } from '../../ui-components/utils';
import { getError } from '../../components/Editor/utils';

import {
    Actions as ServiceActions,
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";

import {
    ActionKeyStore as InterfaceActionKeyStore
} from "../../components/App/redux/actions";

import {
    ActionKeyStore as VFSActionKeyStore,
} from '../redux/actions';

import {
    Actions as MessageBoxActions,
} from "../../components/MessageBox/redux/actions";

const getRequestResponse = (state, path) => {
    return {
        data: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.RESULTS]),
        isFetching: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.IS_FETCHING]),
        error: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.ERROR]),
    }
}
export const mapStateToProps = (state, ownProps) => {
    const query = state.router.location.query;
    const queryConfiguration = {
        service: "VSD",
        query: {
            parentResource: "enterprises",
        }
    };
    const context = state.interface.get(InterfaceActionKeyStore.CONTEXT);
    let parentQuery = state.VFS.get(VFSActionKeyStore.VFS_SELECTED_FLOW_PARENT_QUERY);
    if (!parentQuery || Object.getOwnPropertyNames(parentQuery).length <= 0) {
        parentQuery = context;
    }

    const props = {
        data: state.VFS.get(VFSActionKeyStore.VFS_SELECTED_FLOW_DATA),
        parentQuery: parentQuery,
        parentPath: state.VFS.get(VFSActionKeyStore.VFS_SELECTED_FLOW_PARENT_PATHNAME),
        context: context,
        visualizationType: state.interface.get(InterfaceActionKeyStore.VISUALIZATION_TYPE),
        isConnected: state.services.getIn([ServiceActionKeyStore.REQUESTS, ServiceManager.getRequestID(queryConfiguration), ServiceActionKeyStore.RESULTS]),
        formObject: state.form ? state.form['flow-editor'] : null,
        getFieldError: (fieldName) => getError(state, 'flow-editor', fieldName),
        query,
        ...selectFieldValues(state,
            'flow-editor',
            'locationType',
            'networkType',
            'locationID',
            'networkID',
            'mirrorDestinationType',
            'l2domainID',
            'parentID',
        )
    };

    const domainID = (props.data && props.data.nuage_metadata && props.data.nuage_metadata.domainId) ? props.data.nuage_metadata.domainId : null;
    const enterpriseID = props.context && props.context.enterpriseID ? props.context.enterpriseID : null;
    props.mirrordestinations = getRequestResponse(state, "mirrordestinations");
    const l2DomainID = (props.formObject && props.formObject.values) ? props.formObject.values.l2domainID : null;

    if (enterpriseID) {
        props.enterprisenetworks = getRequestResponse(state, `enterprises/${enterpriseID}/enterprisenetworks`);
        props.networkmacrogroups = getRequestResponse(state, `enterprises/${enterpriseID}/networkmacrogroups`);
        props.l2domains = getRequestResponse(state, `enterprises/${enterpriseID}/l2domains`);
        props.l7applicationsignatures = getRequestResponse(state, `enterprises/${enterpriseID}/l7applicationsignatures`);
    }
    if (domainID) {
        props.policygroups = getRequestResponse(state, `domains/${domainID}/policygroups`);
        props.pgexpressions = getRequestResponse(state, `domains/${domainID}/pgexpressions`);
        props.zones = getRequestResponse(state, `domains/${domainID}/zones`);
        props.subnets = getRequestResponse(state, `domains/${domainID}/subnets`);
        props.vfpolicies = getRequestResponse(state, `domains/${domainID}/virtualfirewallpolicies`);
    }

    if (l2DomainID) {
        props.overlaymirrordestinations = getRequestResponse(state, `l2domains/${l2DomainID}/overlaymirrordestinations`);
    }

    return props;
}

export const actionCreators = (dispatch) => ({
    fetchDomainFirewallPoliciesIfNeeded: (domainID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "domains",
                parentID: domainID,
                resource: "virtualfirewallpolicies"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchFirewallRulesIfNeeded: (policyID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "virtualfirewallpolicies",
                parentID: policyID,
                resource: "virtualfirewallrules"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchSubnetsIfNeeded: (domainID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "domains",
                parentID: domainID,
                resource: "subnets"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchMirrorDestinationsIfNeeded: () => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "mirrordestinations",
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchZonesIfNeeded: (domainID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "domains",
                parentID: domainID,
                resource: "zones"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchNetworkMacrosIfNeeded: (enterpriseID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "enterprises",
                parentID: enterpriseID,
                resource: "enterprisenetworks"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchNetworkMacroGroupsIfNeeded: (enterpriseID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "enterprises",
                parentID: enterpriseID,
                resource: "networkmacrogroups"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchL2DomainsIfNeeded: (enterpriseID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "enterprises",
                parentID: enterpriseID,
                resource: "l2domains"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchPGsIfNeeded: (domainID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "domains",
                parentID: domainID,
                resource: "policygroups"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchPGExpressionsIfNeeded: (domainID) => {
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "domains",
                parentID: domainID,
                resource: "pgexpressions"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchOverlayMirrorDestinationsIfNeeded: (domainID) => {
        //overlaymirrordestinations
        const configuration = {
            service: "VSD",
            query: {
                parentResource: "l2domains",
                parentID: domainID,
                resource: "overlaymirrordestinations"
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchL7ApplicationSignaturesIfNeeded: (enterpriseID) => {
        const config = {
            service: 'VSD',
            query: {
                parentResource: 'enterprises',
                parentID: enterpriseID,
                resource: "l7applicationsignatures",
            }
        }
        return dispatch(ServiceActions.fetchIfNeeded(config));
    },
    goTo: (pathname, query) => dispatch(push({pathname: pathname, query: query})),
    showMessageBox: (title, body) => dispatch(MessageBoxActions.toggleMessageBox(true, title, body)),
    changeFieldValue: (formName, fieldName, fieldValue) => dispatch(change(formName, fieldName, fieldValue)),
});
