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
    ActionKeyStore as VFSActionKeyStore,
} from '../redux/actions';

import {
    Actions as MessageBoxActions,
} from "../../components/MessageBox/redux/actions";

import {
    getMetaDataAttribute,
    getEnterpriseID,
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
const vfsPoliciesConfig = (domainID) => {
    return (
            {
                service: "VSD",
                query: {
                    parentResource: "domains",
                    parentID: domainID,
                    resource: "virtualfirewallpolicies",
                    filter: 'policyState == "DRAFT"',
                }
            }
        );
}

const vfsRulesConfig = (domainID, protocol, { locationType, locationID, networkType, networkID } ) => {

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
            parentResource: "domains",
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
    } = props;
    const enterpriseID = getEnterpriseID(props);
    const domainID = getMetaDataAttribute(data, 'domainId');

    switch (type) {
        case 'ZONE':
            fetchZonesIfNeeded(domainID);
            break;
        case 'SUBNET':
            fetchSubnetsIfNeeded(domainID);
            break;
        case 'POLICYGROUP':
            fetchPGsIfNeeded(domainID);
            break;
        case 'PGEXPRESSION':
            fetchPGExpressionsIfNeeded(domainID);
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
                fetchFirewallRulesIfNeeded(domainID, protocol, args);
            }
            break;
        default:

    }
}

export const mapStateToProps = (state, ownProps) => {
    const query = state.router.location.query;
    const { operation } = query ? query : {};
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
        'networkID') :
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

    const props = {
        ...buildMapStateToProps(state, ownProps),
        operation,
        isConnected: state.services.getIn([ServiceActionKeyStore.REQUESTS, ServiceManager.getRequestID(queryConfiguration), ServiceActionKeyStore.RESULTS]),
        formObject,
        getFieldError: (fieldName) => getError(state, formName, fieldName),
        query,
        ...fieldValues,
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
        const formValues = formObject ? formObject.values : [];
        const protocol = props.data ? getNetworkProtocolForText(props.data.protocol) : null;
        const vfrulesReqID = ServiceManager.getRequestID(vfsRulesConfig(domainID, protocol, formValues))
        props.vfrules = getRequestResponse(state, vfrulesReqID);
        const reqID = ServiceManager.getRequestID(vfsPoliciesConfig(domainID));
        props.vfpolicies = getRequestResponse(state, reqID);
    }

    if (l2DomainID) {
        props.overlaymirrordestinations = getRequestResponse(state, `l2domains/${l2DomainID}/overlaymirrordestinations`);
    }

    return props;
}

export const actionCreators = (dispatch) => ({
    fetchDomainFirewallPoliciesIfNeeded: (domainID) => {
        return dispatch(ServiceActions.fetchIfNeeded(vfsPoliciesConfig(domainID)));
    },
    fetchFirewallRulesIfNeeded: ( domainID, protocol, values ) => {
        const configuration = vfsRulesConfig(domainID, protocol, values);
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
