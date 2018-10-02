import React from 'react';
import { change, submit } from 'redux-form';
import { getPOSTRequestID } from './utils';
import style from '../../ui-components/style';
import {
    ActionKeyStore as VFSActionKeyStore,
} from '../../features/redux/actions';

import {
    Actions as MessageBoxActions,
} from "../MessageBox/redux/actions";

import {
    Actions as ServiceActions,
} from "../../services/servicemanager/redux/actions";

const getEntity = (ID, state) => state.VFS.getIn([VFSActionKeyStore.SELECTED_ROW, ID, VFSActionKeyStore.SELECTED_ROW_DATA])

const post = ({ values, configuration, dispatch }) => {
    dispatch(ServiceActions.postIfNeeded(configuration, values));
}

const update = ({ values, configuration, dispatch, getState }) => {
    const { ID } = values;
    const body = getEntity(ID, getState());
    dispatch(ServiceActions.updateIfNeeded(configuration, body, values));
}

const add = ({values, configuration, dispatch, getState}) => {
    const { ID } = values;
    const entity = getEntity(ID, getState());
    dispatch(ServiceActions.addIfNeeded(configuration, entity, values));
}

export const formSubmit = (values, configuration) => (dispatch, getState) => {
    const { ID } = values;
    const { action } = configuration;
    if (action) {
        if (action === 'ADD') {
            add({values, configuration, dispatch, getState});
        }
    }
    else {
        if (ID) {
            update({values, configuration, dispatch, getState});
        }
        else {
            post({values, configuration, dispatch});
        }
    }
};

export const submitFailure = (configuration, errors) => (dispatch, getState) => {
    if (errors && errors.length > 0) {
        const errorInfo = () => {
            const errorDesc = Array.isArray(errors) ? errors.map(item => <span style={style.errorSpan}>{item.description}</span>)
                : <span style={style.errorSpan}>{errors}</span>;
            return (
                <div style={style.errorField}>
                    {errorDesc}
                </div>
            );
        }
        const errorTitle = errors[0].title;
        dispatch(MessageBoxActions.toggleMessageBox(true, errorTitle, errorInfo()));
        dispatch(ServiceActions.deleteRequest(getPOSTRequestID(configuration)));
    }
}

export const submitSuccess = (configuration, onDone) => (dispatch, getState) => {
    dispatch(MessageBoxActions.toggleMessageBox(true, "Success", "The request has been posted to the server successfully "));
    dispatch(ServiceActions.deleteRequest(getPOSTRequestID(configuration)));
    if (onDone) {
        onDone();
    }
}

export const clickSubmit = (formName) => (dispatch, getState) => {
    dispatch(submit(formName));
}

export const entityValidation = (values, validationFunction) => (dispatch, getState) => validationFunction(values);

export const changeFieldValue = (formName, fieldName, fieldValue) => (dispatch) => dispatch(change(formName, fieldName, fieldValue));
