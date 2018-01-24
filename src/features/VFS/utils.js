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

export const isL3Domain = resourceName => {
    return resourceName === 'domains';
}

export const getDomainID = (resourceName, data) => {
    return isL3Domain(resourceName) ? getMetaDataAttribute(data, 'domainId') : getMetaDataAttribute(data, 'l2domainId');
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
