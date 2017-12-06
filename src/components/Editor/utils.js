import get from 'lodash/get';
import { ServiceManager } from "../../services/servicemanager";

import {
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";

export const getPOSTRequestID = (parent, resourceName) => {
    if (!(parent && parent.resource && parent.ID && resourceName)) {
        return undefined;
    }
    let configuration = {
        service: "VSD",
        query: {
            parentResource: parent.resource,
            parentID: parent.ID,
            resource: resourceName
        }
    }

    return ServiceManager.getRequestID(configuration);
}

export const parseServerErrors = (response) => {
    const errors = [];
    if (response.errors && Array.isArray(response.errors)) {
        response.errors.forEach(({ property, descriptions }, index) => {
            if (descriptions && Array.isArray(descriptions)) {
                descriptions.forEach(({ title, description }) => {
                    errors.push({
                        title,
                        description,
                    });
                });
            }
        });
    }
    else if (response.errors) {
        errors.push({
            title: 'Internal Error',
            description: response.errors,
        })
    }
    if (response.internalErrorCode && response.stackTrace) {
        errors.push({
            title: `Error Code: ${response.internalErrorCode}`,
            description: response.stackTrace,
        })
    }
    return errors;
}

export const getServerErrors = (state, parent, resourceName, ) => {
    const requestID = getPOSTRequestID(parent, resourceName);
    const errorResponse = state.services.getIn([ServiceActionKeyStore.REQUESTS, requestID, ServiceActionKeyStore.ERROR]);
    return errorResponse ? parseServerErrors(errorResponse.responseJSON) : null;
}

export const isSubmitSuccessfull = (state, parent, resourceName) => {
    const requestID = getPOSTRequestID(parent, resourceName);
    if (!requestID) {
        return false;
    }

    const results = state.services.getIn([ServiceActionKeyStore.REQUESTS, requestID, ServiceActionKeyStore.RESULTS]);
    return results && results.length > 0;

}

export const getEditorErrors = (state, formName) => get(state, `form[${formName}].syncErrors`);

export const getError = (state, formName, fieldName) => {
    const errors = getEditorErrors(state, formName);
    return errors ? errors[fieldName] : null;
};

export const required = value => (value ? undefined : 'Mandatory field');
