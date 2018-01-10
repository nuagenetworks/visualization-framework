import { formValueSelector } from 'redux-form';

export const selectFieldValues = (state, formName, ...fields) => {
    const selector = formValueSelector(formName);
    const allVals = {};
    if (fields) {
        fields.map(item => allVals[`${item}Value`] = selector(state, item));
    }
    return allVals;
}
