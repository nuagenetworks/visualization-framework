import React from 'react';
import { push } from 'redux-router';
import { change } from 'redux-form';
import { ServiceManager } from "../../services/servicemanager";
import { selectFieldValues } from '../../ui-components/utils';
import { getError } from '../../components/Editor/utils';
import {
    getNetworkProtocolForText,
} from './NetworkData';

import {
    Actions as ServiceActions,
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";

import {
    ActionKeyStore as InterfaceActionKeyStore
} from "../../components/App/redux/actions";

import {
    Actions as VFSActions,
    ActionKeyStore as VFSActionKeyStore,
} from '../redux/actions';

import {
    Actions as MessageBoxActions,
} from "../../components/MessageBox/redux/actions";

import {
    getEnterpriseID,
    getDomainID
} from './utils';

const getRequestResponse = (state, path) => {
    return {
        data: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.RESULTS]),
        isFetching: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.IS_FETCHING]),
        error: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.ERROR]),
    }
}
const buildMapStateToProps = (state, ownProps) => {
    const query = state.router.location.query;
    const { id } = query;
    const context = state.interface.get(InterfaceActionKeyStore.CONTEXT);
    let parentQuery = state.VFS.getIn([VFSActionKeyStore.SELECTED_ROW, id, VFSActionKeyStore.SELECTED_ROW_PARENT_QUERY]);
    if (!parentQuery || Object.getOwnPropertyNames(parentQuery).length <= 0) {
        parentQuery = context;
    }

    let parentPath = state.VFS.getIn([VFSActionKeyStore.SELECTED_ROW, id, VFSActionKeyStore.SELECTED_ROW_PARENT_PATHNAME]);
    if (!parentPath) {
        parentPath = `${process.env.PUBLIC_URL}/dashboards/vssDomainFlowExplorer`;
    }

    return {
        data: state.VFS.getIn([VFSActionKeyStore.SELECTED_ROW, id, VFSActionKeyStore.SELECTED_ROW_DATA]),
        parentQuery,
        parentPath,
        context,
        visualizationType: state.interface.get(InterfaceActionKeyStore.VISUALIZATION_TYPE),
    };

}
const vfsPoliciesConfig = (domainID, resourceName = 'domains') => {
    return (
            {
                service: "VSD",
                query: {
                    parentResource: resourceName,
                    parentID: domainID,
                    resource: "virtualfirewallpolicies",
                    filter: 'policyState == "DRAFT"',
                }
            }
        );
}

const vfsRulesConfig = (domainID, protocol, { locationType, locationID, networkType, networkID }, resourceName = 'domains' ) => {

    let xNuageFilter = `protocol == "${protocol}"`;
    if (locationType) {
        xNuageFilter = `${xNuageFilter} AND locationType == "${locationType}"`
    }
    if (locationID) {
        xNuageFilter = `${xNuageFilter} AND locationID == "${locationID}"`
    }

    if (networkType) {
        xNuageFilter = `${xNuageFilter} AND networkType == "${networkType}"`
    }
    if (networkID) {
        xNuageFilter = `${xNuageFilter} AND networkID == "${networkID}"`
    }

    // filter: xNuageFilter,
    const configuration = {
        service: "VSD",
        query: {
            parentResource: resourceName,
            parentID: domainID,
            resource: "virtualfirewallrules",
            filter: xNuageFilter,
        }
    }
    return configuration;
}

export const showMessageBoxOnNoFlow = (props) => {
    const { data, showMessageBox, toggleError } = props;

    if (!data || Object.getOwnPropertyNames(data).length <= 0) {
        const body = () =>
            <span style={{ display: 'inline-flex', color: 'blue', fontSize: 12, padding: 20 }}>Select first a flow to use for creating a new Virtual Firewall Rule</span>;

        showMessageBox('No flow selected', body());
        toggleError(true);
        return false;
    }
    return true;
}

export const fetchAssociatedObjectIfNeeded = (props) => {
    const {
        type,
        ID,
        args,
        data,
        fetchSubnetsIfNeeded,
        fetchZonesIfNeeded,
        fetchPGsIfNeeded,
        fetchPGExpressionsIfNeeded,
        fetchNetworkMacroGroupsIfNeeded,
        fetchNetworkMacrosIfNeeded,
        fetchMirrorDestinationsIfNeeded,
        fetchL2DomainsIfNeeded,
        fetchOverlayMirrorDestinationsIfNeeded,
        fetchL7ApplicationSignaturesIfNeeded,
        fetchFirewallRulesIfNeeded,
        resourceName,
    } = props;
    const enterpriseID = getEnterpriseID(props);
    const domainID = getDomainID(resourceName, data);

    switch (type) {
        case 'ZONE':
            fetchZonesIfNeeded(domainID, resourceName, ID);
            break;
        case 'SUBNET':
            fetchSubnetsIfNeeded(domainID, resourceName, ID);
            break;
        case 'POLICYGROUP':
            fetchPGsIfNeeded(domainID, resourceName, ID);
            break;
        case 'PGEXPRESSION':
            fetchPGExpressionsIfNeeded(domainID, resourceName, ID);
            break;
        case 'ENTERPRISE_NETWORK':
            fetchNetworkMacrosIfNeeded(enterpriseID);
            break;
        case 'NETWORK_MACRO_GROUP':
            fetchNetworkMacroGroupsIfNeeded(enterpriseID);
            break;
        case 'l2domainID':
            fetchL2DomainsIfNeeded(enterpriseID);
            break;
        case 'mirrorDestinationID':
            fetchMirrorDestinationsIfNeeded();
            break;
        case 'overlayMirrorDestinationID':
            fetchOverlayMirrorDestinationsIfNeeded(ID);
            break;
        case 'associatedL7ApplicationSignatureID':
            fetchL7ApplicationSignaturesIfNeeded(enterpriseID);
            break;
        case 'virtualfirewallrules':
            const { locationType, networkType } = args;
            if (locationType && networkType ) {
                const protocol = getNetworkProtocolForText(data.protocol);
                fetchFirewallRulesIfNeeded(domainID, protocol, args, resourceName);
            }
            break;
        default:

    }
}

export const mapStateToProps = (state, ownProps) => {
    const query = state.router.location.query;
    const { operation, domainType } = query ? query : {};
    const queryConfiguration = {
        service: "VSD",
        query: {
            parentResource: "enterprises",
        }
    };

    const formName = operation === 'add' ? 'add-flow-editor' : 'flow-editor';

    const fieldValues = operation === 'add' ? selectFieldValues(state,
        formName,
        'locationType',
        'networkType',
        'locationID',
        'networkID',
        'ID') :
        selectFieldValues(state,
            formName,
            'locationType',
            'networkType',
            'locationID',
            'networkID',
            'mirrorDestinationType',
            'l2domainID',
            'parentID',
        );
    const formObject = state.form ? state.form[formName] : null;

    const resourceName = (domainType === 'nuage_metadata.domainName' || domainType === 'Domain') ?
        'domains' : 'l2domains';

    const props = {
        ...buildMapStateToProps(state, ownProps),
        operation,
        isConnected: state.services.getIn([ServiceActionKeyStore.REQUESTS, ServiceManager.getRequestID(queryConfiguration), ServiceActionKeyStore.RESULTS]),
        formObject,
        getFieldError: (fieldName) => getError(state, formName, fieldName),
        query,
        resourceName,
        ...fieldValues,
    };

    const domainID = getDomainID(resourceName, props.data);

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
        props.policygroups = getRequestResponse(state, `${resourceName}/${domainID}/policygroups`);
        props.pgexpressions = getRequestResponse(state, `${resourceName}/${domainID}/pgexpressions`);
        props.zones = getRequestResponse(state, `${resourceName}/${domainID}/zones`);
        props.subnets = getRequestResponse(state, `${resourceName}/${domainID}/subnets`);
        const formValues = formObject ? formObject.values : [];
        const protocol = props.data ? getNetworkProtocolForText(props.data.protocol) : null;
        const vfrulesReqID = ServiceManager.getRequestID(vfsRulesConfig(domainID, protocol, formValues, resourceName))
        props.vfrules = getRequestResponse(state, vfrulesReqID);
        const reqID = ServiceManager.getRequestID(vfsPoliciesConfig(domainID, resourceName));
        props.vfpolicies = getRequestResponse(state, reqID);
    }

    if (l2DomainID) {
        props.overlaymirrordestinations = getRequestResponse(state, `l2domains/${l2DomainID}/overlaymirrordestinations`);
    }

    return props;
}

export const actionCreators = (dispatch) => ({
    fetchDomainFirewallPoliciesIfNeeded: (domainID, resourceName = 'domains') => {
        return dispatch(ServiceActions.fetchIfNeeded(vfsPoliciesConfig(domainID, resourceName)));
    },
    fetchFirewallRulesIfNeeded: ( domainID, protocol, values, resourceName = 'domains' ) => {
        const configuration = vfsRulesConfig(domainID, protocol, values, resourceName);
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchSubnetsIfNeeded: (domainID, resourceName = 'domains', ID) => {
        const query = ID ? {
            parentResource: "subnets",
            parentID: ID
        } : {
            parentResource: resourceName,
            parentID: domainID,
            resource: "subnets"
        };

        const configuration = {
            service: "VSD",
            query
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
    fetchZonesIfNeeded: (domainID, resourceName = 'domains', ID) => {
        const query = ID ? {
            parentResource: "zones",
            parentID: ID
        } : {
            parentResource: resourceName,
            parentID: domainID,
            resource: "zones"
        };

        const configuration = {
            service: "VSD",
            query
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
    fetchPGsIfNeeded: (domainID, resourceName = 'domains', ID) => {
        const query = ID ? {
            parentResource: "policygroups",
            parentID: ID
        } : {
            parentResource: resourceName,
            parentID: domainID,
            resource: "policygroups"
        };

        const configuration = {
            service: "VSD",
            query
        }
        return dispatch(ServiceActions.fetchIfNeeded(configuration));
    },
    fetchPGExpressionsIfNeeded: (domainID, resourceName = 'domains', ID) => {
        const query = ID ? {
            parentResource: "pgexpressions",
            parentID: ID
        } : {
            parentResource: resourceName,
            parentID: domainID,
            resource: "pgexpressions"
        };

        const configuration = {
            service: "VSD",
            query
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
    resetSelectedFlow: (vssID) => dispatch(dispatch(VFSActions.selectRow(vssID))),
    selectRule: (ID, rule) => dispatch(dispatch(VFSActions.selectRow(ID, rule))),
});
