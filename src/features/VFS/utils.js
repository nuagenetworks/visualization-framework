import React from 'react';
import { TwoColumnRow } from '../components';

export const getMetaDataAttribute = (data, attrName) => data && data.hasOwnProperty("nuage_metadata") ? data.nuage_metadata[attrName] : null;

export const twoColumnRow = (col1, col2) => <TwoColumnRow firstColumnProps={col1} secondColumnProps={col2} />

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
