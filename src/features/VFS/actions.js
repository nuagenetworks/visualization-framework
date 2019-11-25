import React from 'react';
import { push } from 'react-router-redux';
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
    getDomainID,
    getMetaDataAttribute
} from './utils';

export const NetworkObjectTypes = {
    ZONE: "ZONE",
    SUBNET: "SUBNET",
    POLICYGROUP: "POLICYGROUP",
    PGEXPRESSION: "PGEXPRESSION",
    ENTERPRISE_NETWORK: 'ENTERPRISE_NETWORK',
    NETWORK_MACRO_GROUP: 'NETWORK_MACRO_GROUP',
    L2_DOMAIN_ID: 'l2domainID',
    MIRROR_DESTINATION_ID: 'mirrorDestinationID',
    OVERLAY_MIRROR_DESTINATION_ID: 'overlayMirrorDestinationID',
    L7_APP_SIGNATURE_ID: 'associatedL7ApplicationSignatureID',
    VIRTUAL_FIREWALL_RULE: 'virtualfirewallrules',
    VIRTUAL_FIREWALL_POLICIES: 'virtualfirewallpolicies',
    ANY: 'ANY',
    UNDERLAY_INTERNET_POLICYGROUP: 'UNDERLAY_INTERNET_POLICYGROUP',
};

export const FlowDirection = {
    'EGRESS': 'egress',
    'INGRESS': 'ingress'
}

export const getIDForResource = (type, data) => {
    if (!type) {
        return null;
    }

    switch (type) {
        case NetworkObjectTypes.ZONE:
            return getMetaDataAttribute(data, 'zoneId');
        case NetworkObjectTypes.SUBNET:
            return getMetaDataAttribute(data, 'subnetId');
        case 'direction':
            return getMetaDataAttribute(data, 'direction');
        case NetworkObjectTypes.POLICYGROUP:
            return getMetaDataAttribute(data, 'vportId');
        default:
            return null;
    }
}

const vfsPoliciesConfig = (domainID, resourceName = 'domains') => {
    return (
        {
            service: "VSD",
            query: {
                parentResource: resourceName,
                parentID: domainID,
                resource: "virtualfirewallpolicies",
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

const getConfiguration = ({ parentResource, parentID, resourceName, ID}) => {
    const query = ID ? {
        parentResource: resourceName,
        parentID: ID
    } : {
        parentResource: parentResource,
        parentID: parentID,
        resource: resourceName
    };

    return {
        service: "VSD",
        query
    };
}

export const getRequestID = props => {
    const {
        enterpriseID,
        domainID,
        l2DomainID,
        parentResource,
        type,
        ID,
        data,
        formObject
    } = props;

    let resourceName = null;
    let parentID = null;
    if (!type) {
        return null;
    }
    switch (type) {
        case NetworkObjectTypes.ZONE:
            if (ID) {
                resourceName = "zones";
                parentID = domainID;
            }
            else
            {
                return `${parentResource}/${domainID}/zones`;
            }
            break;
        case NetworkObjectTypes.SUBNET:
            if (ID) {
                resourceName = "subnets";
                parentID = domainID;
            }
            else
            {
                return `${parentResource}/${domainID}/subnets`;
            }
            break;
        case NetworkObjectTypes.POLICYGROUP:
            if (ID) {
                resourceName = "policygroups";
                parentID = domainID;
            }
            else
            {
                return `${parentResource}/${domainID}/policygroups`;
            }
            break;
        case NetworkObjectTypes.PGEXPRESSION:
            if (ID) {
                resourceName = "pgexpressions";
                parentID = domainID;
            }
            else
            {
                return `${parentResource}/${domainID}/pgexpressions`;
            }
            break;
        case NetworkObjectTypes.ENTERPRISE_NETWORK:
            return `enterprises/${enterpriseID}/enterprisenetworks`;
        case NetworkObjectTypes.NETWORK_MACRO_GROUP:
            return `enterprises/${enterpriseID}/networkmacrogroups`;
        case NetworkObjectTypes.L2_DOMAIN_ID:
            return `enterprises/${enterpriseID}/l2domains`;
        case NetworkObjectTypes.MIRROR_DESTINATION_ID:
            return "mirrordestinations";
        case NetworkObjectTypes.OVERLAY_MIRROR_DESTINATION_ID:
            return `l2domains/${l2DomainID}/overlaymirrordestinations`;
        case NetworkObjectTypes.L7_APP_SIGNATURE_ID:
            return `enterprises/${enterpriseID}/l7applicationsignatures`;
        case NetworkObjectTypes.VIRTUAL_FIREWALL_POLICIES:
            return ServiceManager.getRequestID(vfsPoliciesConfig(domainID, parentResource));
        case NetworkObjectTypes.VIRTUAL_FIREWALL_RULE:
            const formValues = formObject ? formObject.values : [];
            const protocol = data ? getNetworkProtocolForText(data.protocol) : null;
            return ServiceManager.getRequestID(vfsRulesConfig(domainID, protocol, formValues, parentResource));
        default:
            return;
    }

    return ServiceManager.getRequestID(getConfiguration({parentResource, parentID, resourceName, ID}));
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
        fetchDomainFirewallPoliciesIfNeeded,
        resourceName,
        domainID,
        enterpriseID
    } = props;

    if (!type) {
        return;
    }

    switch (type) {
        case NetworkObjectTypes.ZONE:
            fetchZonesIfNeeded(domainID, resourceName, ID);
            break;
        case NetworkObjectTypes.SUBNET:
            fetchSubnetsIfNeeded(domainID, resourceName, ID);
            break;
        case NetworkObjectTypes.POLICYGROUP:
            fetchPGsIfNeeded(domainID, resourceName, ID);
            break;
        case NetworkObjectTypes.PGEXPRESSION:
            fetchPGExpressionsIfNeeded(domainID, resourceName, ID);
            break;
        case NetworkObjectTypes.ENTERPRISE_NETWORK:
            fetchNetworkMacrosIfNeeded(enterpriseID);
            break;
        case NetworkObjectTypes.NETWORK_MACRO_GROUP:
            fetchNetworkMacroGroupsIfNeeded(enterpriseID);
            break;
        case NetworkObjectTypes.L2_DOMAIN_ID:
            fetchL2DomainsIfNeeded(enterpriseID);
            break;
        case NetworkObjectTypes.MIRROR_DESTINATION_ID:
            fetchMirrorDestinationsIfNeeded();
            break;
        case NetworkObjectTypes.OVERLAY_MIRROR_DESTINATION_ID:
            fetchOverlayMirrorDestinationsIfNeeded(ID);
            break;
        case NetworkObjectTypes.L7_APP_SIGNATURE_ID:
            fetchL7ApplicationSignaturesIfNeeded(enterpriseID);
            break;
        case NetworkObjectTypes.VIRTUAL_FIREWALL_RULE:
            const { locationType, networkType } = args;
            if (locationType && networkType ) {
                const protocol = getNetworkProtocolForText(data.protocol);
                fetchFirewallRulesIfNeeded(domainID, protocol, args, resourceName);
            }
            break;
        case NetworkObjectTypes.VIRTUAL_FIREWALL_POLICIES:
            fetchDomainFirewallPoliciesIfNeeded (domainID, resourceName);
            break;
        default:

    }
}

export const getNetworkItems = (type, props) => {
    const {
        data,
    } = props;

    const enterpriseID = getEnterpriseID(props);
    const domainID = getDomainID(props.resourceName, data);
    const parentResource = props.resourceName;
    const reqID = getRequestID({type, domainID, enterpriseID, parentResource, ...props});

    return reqID ? props.getRequestResponse(reqID) : null;
}

export const getSourceData = (props) => {
    const { data, matchedData } = props;
    const flowDir = getIDForResource('direction', data);
    return flowDir === FlowDirection.INGRESS ? data : matchedData && matchedData.hasOwnProperty('nuage_metadata') ? matchedData : data;
}

export const getDestinationData = (props) => {
    const { data, matchedData } = props;
    const flowDir = getIDForResource('direction', data);
    return flowDir === FlowDirection.EGRESS ? data : matchedData && matchedData.hasOwnProperty('nuage_metadata') ? matchedData : data;
}

export const getSourceNetworkItems = (props) => {
    const { locationTypeValue } = props;
    const srcData = getSourceData(props);
    const flowDir = getIDForResource('direction', srcData);
    const idForLocationType = getIDForResource(locationTypeValue, srcData);
    if (flowDir === FlowDirection.INGRESS && idForLocationType) {
        const query = {...props, data: srcData};
        if (locationTypeValue === NetworkObjectTypes.POLICYGROUP) {
            query.resourceName = 'vports';
            query.domainID = idForLocationType;
        }
        else {
            query.ID = idForLocationType;
        }
        return getNetworkItems(locationTypeValue, query);
    }
    return getNetworkItems(locationTypeValue, props);
}

export const getDestinationNetworkItems = (props) => {
    const { networkTypeValue } = props;
    const destData = getDestinationData(props);
    const flowDir = getIDForResource('direction', destData);
    const idForNetworkType = getIDForResource(networkTypeValue, destData);
    if (flowDir === FlowDirection.EGRESS && idForNetworkType) {
        const query = {...props, data: destData};
        if (networkTypeValue === NetworkObjectTypes.POLICYGROUP ) {
            query.resourceName = 'vports';
            query.domainID = idForNetworkType;
        }
        else {
            query.ID = idForNetworkType;
        }
        return getNetworkItems(networkTypeValue, query)
    }
    return getNetworkItems(networkTypeValue, props);
}

export const fetchSourceNetworkItems = (props, domainID, enterpriseID) => {
    const { locationTypeValue } = props;
    const srcData = getSourceData(props);
    const flowDir = getIDForResource('direction', srcData);
    const query = { type: locationTypeValue, domainID, enterpriseID, ...props, data: srcData};
    const idForLocationType = getIDForResource(locationTypeValue, srcData);
    if (idForLocationType) {
        if (flowDir === FlowDirection.INGRESS) {
            if (locationTypeValue === NetworkObjectTypes.POLICYGROUP ) {
                query.resourceName = 'vports';
                query.domainID = idForLocationType;
            }
            else
            {
                query.ID = idForLocationType;
            }
        }
    }
    fetchAssociatedObjectIfNeeded(query);
}

export const fetchDestinationNetworkItems = (props, domainID, enterpriseID) => {
    const { networkTypeValue } = props;
    const destData = getDestinationData(props);
    const flowDir = getIDForResource('direction', destData);
    const query = { type: networkTypeValue, domainID, enterpriseID, ...props, data: destData};
    const idForNetworkType = getIDForResource(networkTypeValue, destData);
    if (idForNetworkType) {
        if (flowDir === FlowDirection.EGRESS) {
            if (networkTypeValue === NetworkObjectTypes.POLICYGROUP ) {
                query.resourceName = 'vports';
                query.domainID = idForNetworkType;
            }
            else
            {
                query.ID = idForNetworkType;
            }
        }
    }
    fetchAssociatedObjectIfNeeded(query);
}

const getRequestResponse = (state, path) => {
    return {
        data: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.RESULTS]),
        isFetching: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.IS_FETCHING]),
        error: state.services.getIn([ServiceActionKeyStore.REQUESTS, path, ServiceActionKeyStore.ERROR]),
    }
}

export const getMatchedData = (state, data, id) => {
    const direction = getIDForResource('direction', data);
    const oppositeDirection = direction === FlowDirection.EGRESS ? FlowDirection.INGRESS : FlowDirection.EGRESS;
    const matchedRows = state.VFS.getIn([VFSActionKeyStore.SELECTED_ROW, id, VFSActionKeyStore.SELECTED_MATCHED_ROW_DATA]);
    const matchedData = matchedRows && matchedRows.length > 0 ?
        matchedRows.find( item => item.nuage_metadata.direction === oppositeDirection) : {};
    return matchedData;
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

    const data = state.VFS.getIn([VFSActionKeyStore.SELECTED_ROW, id, VFSActionKeyStore.SELECTED_ROW_DATA]);

    return {
        data,
        matchedData: getMatchedData(state, data, id),
        parentQuery,
        parentPath,
        context,
        visualizationType: state.interface.get(InterfaceActionKeyStore.VISUALIZATION_TYPE),
    };

}

export const showMessageBoxOnNoFlow = (props) => {
    const { data, showMessageBox, toggleError } = props;

    if (!data || Object.getOwnPropertyNames(data).length <= 0) {
        const body = () =>
            <span style={{ display: 'inline-flex', color: 'blue', fontSize: 12, padding: 20 }}>Select first a flow with a valid protocol to create a new Virtual Firewall Rule</span>;
        const errMsg = 'No flow selected';
        showMessageBox(errMsg, body());
        toggleError(true);
        return false;
    }
    return true;
}

export const getFormNameBasedOnOperation = (props) => {
    const { operation, associator, to } = props;
    let formName = 'flow-editor';
    if (!operation) {
        return formName;
    }
    switch (operation) {
        case 'add':
            formName = 'add-flow-editor';
            break;
        case 'associate':
            formName = `${operation}-${associator}-${to}`;
            break;
        case 'create':
        default:
            formName = 'flow-editor';
            break;
    }
    return formName;
}

export const mapStateToProps = (state, ownProps) => {
    const query = state.router.location.query;
    const { operation, domainType, associator, to } = query ? query : {};
    const queryConfiguration = {
        service: "VSD",
        query: {
            parentResource: "enterprises",
        }
    };

    let formName = getFormNameBasedOnOperation({...ownProps, operation, associator, to});

    const fieldValues = operation === 'add' ? selectFieldValues(state,
        formName,
        'locationType',
        'networkType',
        'locationID',
        'networkID',
        'ID',
        'parentID',
        'protocol',) :
        selectFieldValues(state,
            formName,
            'locationType',
            'networkType',
            'locationID',
            'networkID',
            'mirrorDestinationType',
            'l2domainID',
            'parentID',
            'protocol',
            'ID'
        );
    const formObject = state.form ? state.form[formName] : null;

    const resourceName = (domainType === 'nuage_metadata.domainName' || domainType === 'Domain') ?
        'domains' : 'l2domains';

    return {
        ...buildMapStateToProps(state, ownProps),
        formName,
        operation,
        associator,
        to,
        isConnected: state.services.getIn([ServiceActionKeyStore.REQUESTS, ServiceManager.getRequestID(queryConfiguration), ServiceActionKeyStore.RESULTS]),
        formObject,
        getFieldError: (fieldName) => getError(state, formName, fieldName),
        query,
        resourceName,
        getRequestResponse: requestID => getRequestResponse(state, requestID),
        ...fieldValues,
    };
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
