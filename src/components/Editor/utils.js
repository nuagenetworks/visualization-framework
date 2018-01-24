import get from 'lodash/get';
import { ServiceManager } from "../../services/servicemanager";

import {
    ActionKeyStore as ServiceActionKeyStore
} from "../../services/servicemanager/redux/actions";

export const getPOSTRequestID = (configuration) => {
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

export const getServerErrors = (state, configuration ) => {
    const requestID = getPOSTRequestID(configuration);
    const errorResponse = state.services.getIn([ServiceActionKeyStore.REQUESTS, requestID, ServiceActionKeyStore.ERROR]);
    return errorResponse && errorResponse.responseJSON ? parseServerErrors(errorResponse.responseJSON) : null;
}

export const isSubmitSuccessfull = (state, configuration) => {
    const requestID = getPOSTRequestID(configuration);
    if (!requestID) {
        return false;
    }
    const isRequest = state.services.getIn([ServiceActionKeyStore.REQUESTS, requestID]);
    if (!isRequest) {
        return false;
    }
    const isFetching = state.services.getIn([ServiceActionKeyStore.REQUESTS, requestID, ServiceActionKeyStore.IS_FETCHING]);
    const results = state.services.getIn([ServiceActionKeyStore.REQUESTS, requestID, ServiceActionKeyStore.RESULTS]);
    const errors = state.services.getIn([ServiceActionKeyStore.REQUESTS, requestID, ServiceActionKeyStore.ERROR]);
    return !isFetching && !errors;

}

export const getEditorErrors = (state, formName) => get(state, `form[${formName}].syncErrors`);

export const getError = (state, formName, fieldName) => {
    const errors = getEditorErrors(state, formName);
    return errors ? errors[fieldName] : null;
};

export const required = value => (value ? undefined : 'Mandatory field');
