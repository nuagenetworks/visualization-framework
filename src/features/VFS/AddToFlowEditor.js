import React, { PropTypes } from 'react';
import ModalEditor from '../../components/Editor/ModalEditor';
import { Form, Label, Select, Header } from '../../ui-components';
import { buildOptions, getNetworkItems } from './utils';
import { TwoColumnRow } from '../components';

import {
    getNetworkProtocolForValue,
    getNetworkProtocolForText,
    NetworkTypeOptions,
    getNetworkTypeForValue,
    getSecurityPolicyActionsForValue,
} from './NetworkData';

import {
    fetchAssociatedObjectIfNeeded,
    showMessageBoxOnNoFlow
 } from './actions';

const getEntityNameForID = (ID, entityCollection) => {
    const entities = entityCollection && entityCollection.options && entityCollection.options.length > 0 ? entityCollection.options.find(item => item.value === ID) : null;
    return entities && entities.length > 0 ? entities[0] :
        entities && Object.getOwnPropertyNames(entities).length > 0 ? entities : null;
}

const buildVFRuleOptions = (options, srcEntity, destEntity) => {
    if (options && options.data && options.data.length > 0) {
        return options.data.map(item => {
            const desc = item.description ? item.description : '';
            const locationType = getNetworkTypeForValue(item.locationType);
            const networkType = getNetworkTypeForValue(item.networkType);
            let action = getSecurityPolicyActionsForValue(item.action);
            action = action && action.length > 0 ? action[0].text : '';
            const srcEntityName = srcEntity && srcEntity.value === item.locationID ? srcEntity.text : null;
            const destEntityName = destEntity && destEntity.value === item.networkID ? destEntity.text : null;
            const from = srcEntityName ? `${locationType[0].text} ${srcEntityName}` : locationType[0].text;
            const to = destEntityName ? `${networkType[0].text} ${destEntityName}` : networkType[0].text;
            const priority = item.priority;
            const text = `${desc}: D-Port: ${item.destinationPort}: From ${from} To: ${to} Action: ${action} Priority: ${priority}`;
            return ({ text, value: item.ID });
        });
    }
    if (options && options.isFetching) {
        return "Fetching...";
    }
    if (options && options.error) {
        return options.error;
    }
    return "No Data available";
}

class AddToFlowEditor extends React.Component {
    constructor(...props) {
        super(...props);

        this.state = {
            opened: false,
            error: false,
        }
        this.toggleError = this.toggleError.bind(this);
        this.putConfiguration = this.putConfiguration.bind(this);
        this.resetFieldsOnChange = this.resetFieldsOnChange.bind(this);
    }

    componentWillMount() {
        this.setState({opened: true, formName: 'add-flow-editor', error: true});
    }

    handleSelectRule = (evt) => {
        const { preventDefault, ...values } = evt;
        const ID = values ? Object.values(values).join('') : null;
        if (ID) {
            const vfrules = getNetworkItems('virtualfirewallrules', this.props);
            if (vfrules && vfrules.data && vfrules.data.length > 0) {
                const { selectRule, data } = this.props;
                if (selectRule && data) {
                    const object = Object.assign({}, vfrules.data[0]);
                    var re = new RegExp(data.destinationport, 'gi');
                    object.destinationPort = object.destinationPort === '*' || object.destinationPort.match(re) ? object.destinationPort :
                        `${object.destinationPort},${data.destinationport}`;
                    selectRule(ID, object);
                }
            }
        }
    }

    buildSourceField = (source) => {
        let srcList = null;
        if (source && !(source.type === 'ANY' || source.type === 'UNDERLAY_INTERNET_POLICYGROUP')) {
            const srcOptions = buildOptions(source);
            srcList = {
                name: 'locationID',
                component: Select,
            };
            if (srcOptions && Array.isArray(srcOptions)) {
                srcList.options = srcOptions;
            }
            else {
                srcList.text = srcOptions;
            }
        }

        return srcList;
    }

    buildDestField = (destination) => {
        let destList = null;
        if (destination && !(destination.type === 'ANY' || destination.type === 'UNDERLAY_INTERNET_POLICYGROUP')) {
            const destOptions = buildOptions(destination);
            destList = {
                name: 'networkID',
                component: Select,
            };
            if (destOptions && Array.isArray(destOptions)) {
                destList.options = destOptions;
            }
            else {
                destList.text = destOptions;
            }
        }
        return destList;
    }

    validate = (values) => {
        const { ID } = values;

        if (!ID) {
            return { ID: "Please select a valid virtual firewall rule"};
        }
        return {};
    }

    initialValues = (data) => {
        const protocol = getNetworkProtocolForValue(data.protocol);

        return ({
            protocol: protocol
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        return nextProps !== this.props || this.state !== nextState;
    }

    fetchVFRulesIfNeeded = (props) => {
        const {
            data,
            locationTypeValue,
            locationIDValue,
            networkTypeValue,
            networkIDValue,
            operation,
        } = props;
        if (!data || Object.getOwnPropertyNames(data).length <= 0
            || operation !== 'add') {
            return;
        }
        const vfRules = getNetworkItems('virtualfirewallrules', this.props);
        if (vfRules && vfRules.data && Object.getOwnPropertyNames(vfRules.data).length > 0)
            return;
         if (!locationTypeValue || (locationTypeValue !== 'ANY' && locationTypeValue !== 'UNDERLAY_INTERNET_POLICYGROUP' && !locationIDValue)) {
             return;
         }
         if (!networkTypeValue || (networkTypeValue !== 'ANY' && networkTypeValue !== 'UNDERLAY_INTERNET_POLICYGROUP' && !networkIDValue)) {
            return;
        }
        const proto = getNetworkProtocolForText(data.protocol);
        fetchAssociatedObjectIfNeeded({
            type: 'virtualfirewallrules',
            args: {
                locationType: locationTypeValue,
                locationID: locationIDValue,
                networkType: networkTypeValue,
                networkID: networkIDValue,
                protocol: proto ? proto : '6',
            }, ...props});
    }

    componentWillReceiveProps(nextProps) {
        const {
            data,
            locationTypeValue,
            locationIDValue,
            networkTypeValue,
            networkIDValue,
        } = nextProps;

        if (!data || Object.getOwnPropertyNames(data).length <= 0) {
            return;
        }
        const srcNetworkItems = {
            ...getNetworkItems(locationTypeValue, nextProps),
            type: locationTypeValue,
            ID: locationIDValue,
        };
        const destNetworkItems = {
            ...getNetworkItems(networkTypeValue, nextProps),
            type: networkTypeValue,
            ID: networkIDValue,
        };
        if (!srcNetworkItems.data) {
            fetchAssociatedObjectIfNeeded({ type: locationTypeValue, ...nextProps});
        }
        if (!destNetworkItems.data) {
            fetchAssociatedObjectIfNeeded({ type: networkTypeValue, ...nextProps});
        }

        this.fetchVFRulesIfNeeded(nextProps);
        const vfrules = getNetworkItems('virtualfirewallrules', nextProps);
        if (vfrules && vfrules.data && vfrules.data.length > 0) {
            this.toggleError(false);
        }
        else {
            this.toggleError(true);
        }
    }

    resetFieldsOnChange = (value, ...fields) => {
        const { changeFieldValue } = this.props;
        const { formName } = this.state;
        if (value) {
            if (fields) {
                fields.forEach(fieldName => changeFieldValue(formName, fieldName, null))
            }
        }
    }

    toggleError = (flag) => {
        if (this.state.error !== flag ) {
            this.setState({ error: flag});
        }
    }

    buildVFRuleField = (srcEntity, destEntity) => {
        const vfrules = getNetworkItems('virtualfirewallrules', this.props);
        const vfRuleOptions = buildVFRuleOptions(vfrules, srcEntity, destEntity);
        if (vfRuleOptions && Array.isArray(vfRuleOptions)) {
            return (
                <Form.Field
                    name="ID"
                    component={Select}
                    options={vfRuleOptions}
                    onChange={this.handleSelectRule}
                />
            );
        }
        else {
            return (<span>{vfRuleOptions}</span>);
        }

    }

    handleCancel = () => {
        // first dispatch a reset of the selection
        const { resetSelectedFlow, IDValue } = this.props;
        resetSelectedFlow(IDValue);
        this.props.handleClose();
    }

    handleDone = () => {
        // first dispatch a reset of the selection
        const { resetSelectedFlow, query: { id }, IDValue } = this.props;
        resetSelectedFlow(id);
        resetSelectedFlow(IDValue);
        this.props.handleClose();
    }

    putConfiguration = () => {
        const { IDValue } = this.props;
        return {
            service: "VSD",
            query: {
                parentResource: "virtualfirewallrules",
                parentID: IDValue,
            }
        }
    }

    renderAdd = () => {
        const {
            data,
            locationTypeValue,
            networkTypeValue,
            locationIDValue,
            networkIDValue,
        } = this.props;

        const title = "Add to Firewall Rule";
        const buttonLabel = "Add";
        const protocol = data && data.protocol ? data.protocol : '';
        const dPort = data && data.destinationport ? data.destinationport : '';
        const srcNetworkItems = {
            ...getNetworkItems(locationTypeValue, this.props),
            type: locationTypeValue,
            ID: locationIDValue,
        };
        const destNetworkItems = {
            ...getNetworkItems(networkTypeValue, this.props),
            type: networkTypeValue,
            ID: networkIDValue,
        };
        const srcList = this.buildSourceField(srcNetworkItems);

        const destList = this.buildDestField(destNetworkItems);
        const srcEntity = locationIDValue && srcList ? getEntityNameForID(locationIDValue, srcList) : null;
        const destEntity = networkIDValue && destList ? getEntityNameForID(networkIDValue, destList) : null;

        return (
            <ModalEditor
                title={title}
                submitLabel={buttonLabel}
                open={this.state.opened}
                name={this.state.formName}
                onCancel={this.handleCancel}
                onDone={this.handleDone}
                width='60%'
                onValidate={this.validate}
                configuration={this.putConfiguration}
                errored={this.state.error}
            >
                <Header>Match Criteria</Header>
                <TwoColumnRow firstColumnProps={{
                    name: 'locationType',
                    label: 'Source',
                    component: Select,
                    options: NetworkTypeOptions,
                    onChange:(e) => this.resetFieldsOnChange(e, 'locationID')
                }} secondColumnProps={{
                    name: 'networkType',
                    label: 'Destination',
                    component: Select,
                    options: NetworkTypeOptions,
                    onChange:(e) => this.resetFieldsOnChange(e, 'networkID')
                }} />
                { (srcList || destList) &&  <TwoColumnRow firstColumnProps={srcList} secondColumnProps={destList} /> }

                <Label>Virtual Firewall Rules</Label>
                {
                    (locationTypeValue && networkTypeValue && this.buildVFRuleField(srcEntity, destEntity)) || <span>Select a source and destination type </span>
                }

                <TwoColumnRow firstColumnProps={{
                    name: 'protocol',
                    label: 'Protocol',
                    text: protocol,
                }} secondColumnProps={{
                    name: 'dPort',
                    label: 'Destination Port',
                    text: dPort,
                }} />
            </ModalEditor>
        );
    }

    renderError = () => {
        const title = "Add to Firewall Rule";
        const buttonLabel = "Add";

        return(
            <ModalEditor
                title={title}
                submitLabel={buttonLabel}
                open={this.state.opened}
                name={this.state.formName}
                onCancel={this.props.handleClose}
                width='60%'
                errored={true}
            >
                <span>No flow selected</span>
            </ModalEditor>
        );
    }

    render() {
        if (!showMessageBoxOnNoFlow({...this.props, toggleError: this.toggleError})) {
            return this.renderError();
        }
        return this.renderAdd();
    }
}

AddToFlowEditor.defaultProps = {
    operation: null,
}

AddToFlowEditor.propTypes = {
    operation: PropTypes.string,
    data: PropTypes.shape({}).isRequired,
    parentQuery: PropTypes.shape({}).isRequired,
    parentPath: PropTypes.string.isRequired,
}

export default AddToFlowEditor;
