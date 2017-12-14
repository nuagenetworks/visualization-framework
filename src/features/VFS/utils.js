export const getMetaDataAttribute = (data, attrName) => data && data.hasOwnProperty("nuage_metadata") ? data.nuage_metadata[attrName] : null;

export const buildOptions = (options) => {
    if (options && options.data && options.data.length > 0) {
        return options.data.map(item => ({ text: item.name, value: item.ID }));
    }
    if (options && options.isFetching) {
        return "Fetching...";
    }
    if (options && options.error) {
        return options.error;
    }
    return "No Data available";
}

export const getNetworkItems = (type, props) => {
    const {
        zones,
        subnets,
        policygroups,
        pgexpressions,
        enterprisenetworks,
        networkmacrogroups,
        l2domains,
        mirrordestinations,
        overlaymirrordestinations,
        l7applicationsignatures,
        vfrules,
    } = props;
    switch (type) {
        case 'ZONE':
            return zones;
        case 'SUBNET':
            return subnets;
        case 'POLICYGROUP':
            return policygroups;
        case 'PGEXPRESSION':
            return pgexpressions;
        case 'ENTERPRISE_NETWORK':
            return enterprisenetworks;
        case 'NETWORK_MACRO_GROUP':
            return networkmacrogroups;
        case 'l2domainID':
            return l2domains;
        case 'mirrorDestinationID':
            return mirrordestinations;
        case 'overlayMirrorDestinationID':
            return overlaymirrordestinations;
        case 'associatedL7ApplicationSignatureID':
            return l7applicationsignatures;
        case 'virtualfirewallrules':
            return vfrules;
        default:
            return null;
    }
}

export const  getEnterpriseID = (props) => {
    const {
        data,
        query,
        context
    } = props;

    let enterpriseID = getMetaDataAttribute(data, 'enterpriseId');
    if (!enterpriseID && query) {
        enterpriseID = query.enterpriseID;
    }
    if (!enterpriseID && context) {
        enterpriseID = context.enterpriseID ? context.enterpriseID : context.enterpriseId;
    }
    return enterpriseID;
}
