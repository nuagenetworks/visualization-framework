import React from 'react';
import { change, submit } from 'redux-form';
import { getPOSTRequestID } from './utils';
import { errorField, errorSpan } from '../../ui-components/style';

import {
    Actions as MessageBoxActions,
} from "../MessageBox/redux/actions";

import {
    Actions as ServiceActions,
} from "../../services/servicemanager/redux/actions";

export const formSubmit = (values, parent, resourceName) => (dispatch, getState) => {
    const parentID = parent.ID ? parent.ID : values.parentID;
    let configuration = {
        service: "VSD",
        query: {
            parentResource: parent.resource,
            parentID: parentID,
            resource: resourceName
        }
    }
    dispatch(ServiceActions.postIfNeeded(configuration, values));
};

export const submitFailure = (parent, resourceName, errors) => (dispatch, getState) => {
    if (errors && errors.length > 0) {
        const errorInfo = () => {
            const errorDesc = errors.map(item => <span style={errorSpan}>{item.description}</span>);
            return (
                <div style={errorField}>
                    {errorDesc}
                </div>
            );
        }
        const errorTitle = errors[0].title;
        dispatch(MessageBoxActions.toggleMessageBox(true, errorTitle, errorInfo()));
        dispatch(ServiceActions.deleteRequest(getPOSTRequestID(parent, resourceName)));
    }
}

export const submitSuccess = (parent, resourceName, onDone) => (dispatch, getState) => {
    dispatch(MessageBoxActions.toggleMessageBox(true, "Success", "The request has been posted to the server successfully "));
    dispatch(ServiceActions.deleteRequest(getPOSTRequestID(parent, resourceName)));
    if (onDone) {
        onDone();
    }
}

export const clickSubmit = (formName) => (dispatch, getState) => {
    dispatch(submit(formName));
}

export const entityValidation = (values, validationFunction) => (dispatch, getState) => validationFunction(values);

export const changeFieldValue = (formName, fieldName, fieldValue) => (dispatch) => dispatch(change(formName, fieldName, fieldValue));
