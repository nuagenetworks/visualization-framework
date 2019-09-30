import React from 'react';
import PropTypes from 'prop-types';

import ModalEditor from '../../components/Editor/ModalEditor';
import { required } from '../../components/Editor/utils';
import { TextInput, Select, Checkbox, Header } from '../../ui-components';
import { TwoColumnRow } from '../components';

import {
    buildOptions,
    getDomainID,
    getEnterpriseID, getMetaDataAttribute,
} from './utils';

import {
    NetworkProtocols,
    getNetworkProtocolForText,
    getNetworkTypeOptions,
    SecurityPolicyActions,
    getSecurityPolicyActionsForValue,
    getMirrorDestinationOptions,
    getMirrorDestinationForValue,
} from './NetworkData';
import {
    fetchAssociatedObjectIfNeeded,
    showMessageBoxOnNoFlow,
    NetworkObjectTypes,
    getNetworkItems,
    getSourceNetworkItems,
    getDestinationNetworkItems,
    fetchSourceNetworkItems,
    fetchDestinationNetworkItems,
    getSourceData,
} from './actions';

class CreateFlow extends React.Component {
    constructor(...props) {
        super(...props);

        this.state = {
            opened: false,
            error: false,
        }
        this.resetFieldsOnChange = this.resetFieldsOnChange.bind(this);
        this.toggleError = this.toggleError.bind(this);
        this.handleDone = this.handleDone.bind(this);
        this.postConfiguration = this.postConfiguration.bind(this);
    }

    componentWillMount() {
        this.initialize(this.props);
        this.setState({opened: true, formName: 'flow-editor'});
    }

    handleChangeProtocol = (evt) => {
        const { preventDefault, ...values} = evt;
        const protocol = values ? Object.values(values).join('') : null;
        if (protocol === '1') {
            const { changeFieldValue, formName } = this.props;
            if (changeFieldValue) {
                const ICMPCode = getMetaDataAttribute(this.props.data, 'ICMPCode');
                const ICMPType = getMetaDataAttribute(this.props.data, 'ICMPType');
                if (ICMPCode && ICMPType) {
                    changeFieldValue(formName, 'ICMPCode', ICMPCode);
                    changeFieldValue(formName, 'ICMPType', ICMPType);
                }
            }
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

    buildMirrorDestinations = (mirrordestinations) => {
        let mirrors = null;
        if (mirrordestinations) {
            mirrors = {
                name: 'mirrorDestinationID',
                label: 'Mirror Destination',
                component: Select,
            }
            const mirrordestinationsOptions = buildOptions(mirrordestinations);
            if (Array.isArray(mirrordestinationsOptions) && mirrordestinationsOptions.length > 0) {
                mirrors.options = mirrordestinationsOptions;
                if (mirrordestinations.type) {
                    mirrors.name = mirrordestinations.type;
                    const option = getMirrorDestinationForValue(mirrordestinations.type);
                    if (option && Array.isArray(option)) {
                        mirrors.label = option[0].label ? option[0].label : option[0].text;
                    }
                }
            }
            else {
                mirrors.text = mirrordestinationsOptions;
            }
        }
        return mirrors;
    }


    buildOverlayMirrors = (mirrordestinations, overlaymirrordestinations, changeFieldValue, formName) => {
        let overlaymirrordestinationsField = null;
        if (mirrordestinations && mirrordestinations.ID && overlaymirrordestinations) {
            const overlaymirrordestinationsOptions = overlaymirrordestinations ? buildOptions(overlaymirrordestinations) : null;

            if (overlaymirrordestinationsOptions && Array.isArray(overlaymirrordestinationsOptions) && overlaymirrordestinationsOptions.length > 0)
            {
                overlaymirrordestinationsField = {
                    name: 'overlayMirrorDestinationID',
                    label: 'Mirror Destination',
                    component: Select,
                    options: overlaymirrordestinationsOptions,
                }
            }
            else {
                overlaymirrordestinationsField = {
                    text: overlaymirrordestinationsOptions
                }
            }
        }

        return overlaymirrordestinationsField;
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

    buildL7AppField = (l7applicationsignatures) => {
        let l7Apps = {
            name: 'associatedL7ApplicationSignatureID',
            label: 'L7 Application Signatures',
        };
        if (l7applicationsignatures) {
            const l7Options = buildOptions(l7applicationsignatures);
            if (l7Options && Array.isArray(l7Options)) {
                l7Apps.component = Select;
                l7Apps.options = l7Options;
            }
            else {
                l7Apps.text = l7Options;
            }
        }
        return l7Apps;
    }

    renderEditor = (
            vfsPolicies,
            mirrordestinations,
            source,
            destination,
            overlaymirrordestinations,
            l7applicationsignatures,
            resourceName,
        ) => {
        const { getFieldError, protocolValue, data } = this.props;
        const mirrors = this.buildMirrorDestinations(mirrordestinations);
        const overlaymirrordestinationsField = this.buildOverlayMirrors(mirrordestinations, overlaymirrordestinations);
        const policyOptions = buildOptions(vfsPolicies, item => {
            const imgTitle = item.active ? 'Policy is enabled' : 'Policy is not enabled';
            const text = item.policyState === 'DRAFT' ? `${item.name} - In Draft Mode` : item.name;
            const iconStyle = {
                width: '8px',
                height: '8px',
                verticalAlign: 'center',
                marginRight: '3px'
            }
            const textNode = (primaryText) => (
                <div>
                    <img style={iconStyle} src={`${process.env.PUBLIC_URL}/icons/pil-${item.active ? 'green' : 'red'}.png`} alt="D" title={imgTitle}/>
                    <span>{primaryText}</span>
                </div>
            )
            return {
                text: item.policyState === 'DRAFT' ? text: textNode(text), value: item.ID
            };
        });
        if (!policyOptions || !Array.isArray(policyOptions) || protocolValue === '1') {

            if (vfsPolicies && vfsPolicies.isFetching) {
                return (<div>Fetching...</div>);
            }
            if (vfsPolicies && vfsPolicies.error) {
                this.toggleError(true);
                return vfsPolicies.error;
            }
            if (!vfsPolicies || !vfsPolicies.data || !vfsPolicies.data.length) {
                const errMsg = 'No Virtual Firewall Policies Available';
                return <div>{errMsg}</div>;
            }
        }
        this.toggleError(false);
        const srcList = this.buildSourceField(source);

        const destList = this.buildDestField(destination);

        const l7Apps = this.buildL7AppField(l7applicationsignatures);
        const networkDestinations = getNetworkTypeOptions(resourceName);
        const shouldDisplayDestPort = protocolValue === '6' || protocolValue === '17';
        let ICMPCode, ICMPType;
        if (protocolValue === '1') {
            ICMPCode = data && data.ICMPCode;
            ICMPType = data && data.ICMPType;
        }
        return (
            <div>
                    <TwoColumnRow firstColumnProps={{
                        name: 'parentID',
                        label: 'Virtual Firewall Policy',
                        component: Select,
                        options: policyOptions,
                        error: getFieldError("parentID")
                    }} secondColumnProps={{
                        name: 'description',
                        label: 'Name',
                        component: TextInput,
                        validate: [required],
                    }} />
                <Header>Match Criteria</Header>
                <TwoColumnRow
                    secondColumnProps={{
                        name: 'stateful',
                        label: 'Stateful entry',
                        component: Checkbox,
                        hideLabel: true,
                    }}
                />
                <TwoColumnRow firstColumnProps={{
                    name: 'locationType',
                    label: 'Source',
                    component: Select,
                    options: networkDestinations,
                    validate: [required],
                    error: getFieldError('locationType'),
                    onChange: (e) => this.resetFieldsOnChange(e, 'locationID')
                }} secondColumnProps={{
                    name: 'networkType',
                    label: 'Destination',
                    component: Select,
                    options: networkDestinations,
                    validate: [required],
                    error: getFieldError('networkType'),
                    onChange: (e) => this.resetFieldsOnChange(e, 'networkID')
                }} />
                { (srcList || destList) &&  <TwoColumnRow firstColumnProps={srcList} secondColumnProps={destList} /> }
                { shouldDisplayDestPort &&
                    <TwoColumnRow secondColumnProps={{
                        name: 'destinationPort',
                        label: 'Destination Port',
                        component: TextInput
                    }}/>
                }
                {
                    ICMPCode && ICMPType &&
                        <TwoColumnRow
                            firstColumnProps={{
                                name: 'ICMPCode',
                                label: 'ICMP Code',
                                text: ICMPCode
                            }}
                            secondColumnProps={{
                                name: 'ICMPType',
                                label: 'ICMP Type',
                                text: ICMPType
                            }}
                        />
                }
                <TwoColumnRow firstColumnProps={{
                        name: 'protocol',
                        label: 'Protocol',
                        component: Select,
                        options: NetworkProtocols,
                        error: getFieldError('protocol'),
                        onChange: (value) => this.handleChangeProtocol(value)
                    }} secondColumnProps={l7Apps} />

                <Header>Actions</Header>
                <TwoColumnRow firstColumnProps={{
                    name: 'action',
                    label: 'Action',
                    component: Select,
                    options: SecurityPolicyActions
                }} secondColumnProps={{
                    name: 'mirrorDestinationType',
                    label: "Mirror Destination Type",
                    component: Select,
                    options: getMirrorDestinationOptions(resourceName),
                    onChange: (e) => this.resetFieldsOnChange(e, 'overlayMirrorDestinationID', 'mirrorDestinationID', 'l2domainID')
                }} />
                <TwoColumnRow secondColumnProps={mirrors} />
                { overlaymirrordestinationsField && <TwoColumnRow secondColumnProps={overlaymirrordestinationsField} /> }
                    <TwoColumnRow firstColumnProps={{
                        name: 'flowLoggingEnabled',
                        label: 'Enable Flow Logging',
                        hideLabel: true,
                        component: Checkbox
                    }} secondColumnProps={{
                        name: 'statsLoggingEnabled',
                        label: 'Enable statistics collection',
                        hideLabel: true,
                        component: Checkbox
                    }} />
            </div>
        );
    }

    initialize = (props) => {
        const {
            data,
            fetchDomainFirewallPoliciesIfNeeded,
            operation,
            resourceName
        } = props;
        if (operation !== 'add') {
            const domainID = getDomainID(resourceName, data);
            const enterpriseID = getEnterpriseID(props);
            if (domainID) {
                fetchDomainFirewallPoliciesIfNeeded (domainID, resourceName);
            }
            fetchAssociatedObjectIfNeeded({ type: NetworkObjectTypes.L7_APP_SIGNATURE_ID, domainID, enterpriseID, ...props});
        }
    }

    validate = (values) => {
        const errorObject = {};
        const { description, locationType, destinationType, locationID, networkID, action, parentID, protocol, ICMPCode, ICMPType } = values;
        if (!description) {
            errorObject.description = "Policy Rule name is required";
        }
        if ((locationType !== 'ANY' || locationType !== 'UNDERLAY_INTERNET_POLICYGROUP') && !locationID) {
            errorObject.locationID = "Please select a valid source";
        }
        if ((destinationType !== 'ANY' || destinationType !== 'UNDERLAY_INTERNET_POLICYGROUP') && !networkID) {
            errorObject.networkID = "Please select a valid destination";
        }
        if (!action) {
            errorObject.action = "Please select a valid action";
        }
        if (!parentID) {
            errorObject.parentID = "Please select a valid virtual firewall policy";
        }
        if (protocol === '1' && !(ICMPCode || ICMPType)) {
            errorObject.protocol = "ICMP Require valid ICMP code and type for the flow";
        }
        return errorObject;
    }

    initialValues = (data) => {
        const actions = data && data.type ? getSecurityPolicyActionsForValue(data.type) : [];
        const protocol = getNetworkProtocolForText(data.protocol);
        const destData = getSourceData(this.props);
        const destPort = (protocol === '6' || protocol === '17') ? destData && destData.destinationport ? destData.destinationport : '*' : null;
        let ICMPCode, ICMPType;
        if (protocol === '1') {
            ICMPCode = data && data.ICMPCode;
            ICMPType = data && data.ICMPType;
        }

        return ({
            protocol: protocol ? protocol : '6',
            locationType: 'ANY',
            networkType: 'ANY',
            action:  actions && Array.isArray(actions) && actions.length > 0 ? actions[0].value : 'FORWARD',
            destinationPort: destPort,
            sourcePort: (protocol === '6' || protocol === '17') ? '*' : null,
            ICMPType,
            ICMPCode,
            stateful: true,
        });
    }

    shouldComponentUpdate(nextProps, nextState) {
        const { data } = nextProps;

        const { error } = nextState;

        if (!data || Object.getOwnPropertyNames(data).length <= 0 || error) {
            return false;
        }

        return nextProps !== this.props || this.state !== nextState;
    }

    componentWillReceiveProps(nextProps) {
        const {
            data,
            locationTypeValue,
            locationIDValue,
            networkTypeValue,
            mirrorDestinationTypeValue,
            l2domainIDValue,
            networkIDValue,
            resourceName,
        } = nextProps;

        if (!data || Object.getOwnPropertyNames(data).length <= 0) {
            return;
        }

        const enterpriseID = getEnterpriseID(nextProps);
        const domainID = getDomainID(resourceName, data);

        const srcNetworkItems = {
            ...getSourceNetworkItems(nextProps),
            type: locationTypeValue,
            ID: locationIDValue,
        };
        const destNetworkItems = {
            ...getDestinationNetworkItems(nextProps),
            type: networkTypeValue,
            ID: networkIDValue,
        };

        if (!srcNetworkItems.data) {
            fetchSourceNetworkItems(nextProps, domainID, enterpriseID);
        }
        if (!destNetworkItems.data) {
            fetchDestinationNetworkItems(nextProps, domainID, enterpriseID);
        }
        let mirrordestinations = null;
        if (mirrorDestinationTypeValue ) {
            mirrordestinations = {
                ...getNetworkItems(mirrorDestinationTypeValue, nextProps),
                type: mirrorDestinationTypeValue,
                ID: l2domainIDValue,
            }
            if (!mirrordestinations.data) {
                fetchAssociatedObjectIfNeeded({ type: mirrorDestinationTypeValue, domainID, enterpriseID, ...nextProps});
            }
        }
        let overlaymirrordestinations = null;
        if (l2domainIDValue) {
            overlaymirrordestinations = {
                ...getNetworkItems(NetworkObjectTypes.OVERLAY_MIRROR_DESTINATION_ID, nextProps),
            }
            if (!overlaymirrordestinations.data) {
                fetchAssociatedObjectIfNeeded({type: NetworkObjectTypes.OVERLAY_MIRROR_DESTINATION_ID, domainID, enterpriseID, ID: l2domainIDValue, ...nextProps});
            }
        }
    }

    toggleError = (flag) => {
        if (this.state.error !== flag ) {
            this.setState({ error: flag});
        }
    }

    handleDone = () => {
        // first dispatch a reset of the selection
        const { resetSelectedFlow, query: { id } } = this.props;
        resetSelectedFlow(id);
        this.props.handleClose();
    }

    postConfiguration = () => {
        const { parentIDValue } = this.props;
        return {
            service: "VSD",
            query: {
                parentResource: "virtualfirewallpolicies",
                parentID: parentIDValue,
                resource: "virtualfirewallrules"
            }
        }
    }

    renderModal = () => {
        const {
            data,
            locationTypeValue,
            locationIDValue,
            networkTypeValue,
            networkIDValue,
            mirrorDestinationTypeValue,
            l2domainIDValue,
            resourceName,
        } = this.props;

        //associatedVirtualFirewallRuleID
        const title = "Create Firewall Rule";
        const buttonLabel = "Create";

        const vfpolicies = getNetworkItems(NetworkObjectTypes.VIRTUAL_FIREWALL_POLICIES, this.props);

        const srcNetworkItems = {
            ...getSourceNetworkItems(this.props),
            type: locationTypeValue,
            ID: locationIDValue,
        };
        const destNetworkItems = {
            ...getDestinationNetworkItems(this.props),
            type: networkTypeValue,
            ID: networkIDValue,
        };
        let mirrordestinations = null;
        if (mirrorDestinationTypeValue ) {
            mirrordestinations = {
                ...getNetworkItems(mirrorDestinationTypeValue, this.props),
                type: mirrorDestinationTypeValue,
                ID: l2domainIDValue,
            }
        }
        let overlaymirrordestinations = null;
        if (l2domainIDValue) {
            overlaymirrordestinations = {
                ...getNetworkItems(NetworkObjectTypes.OVERLAY_MIRROR_DESTINATION_ID, this.props),
            }
        }
        const l7applicationsignatures = {
            ...getNetworkItems(NetworkObjectTypes.L7_APP_SIGNATURE_ID, this.props),
        }

        return(
            <ModalEditor
                title={title}
                submitLabel={buttonLabel}
                open={this.state.opened}
                name={this.state.formName}
                onCancel={this.props.handleClose}
                width='60%'
                onValidate={this.validate}
                getInitialValues={() => this.initialValues(data)}
                configuration={this.postConfiguration}
                errored={this.state.error}
                onDone={this.handleDone}
            >

            {
                this.renderEditor(vfpolicies, mirrordestinations, srcNetworkItems, destNetworkItems, overlaymirrordestinations, l7applicationsignatures, resourceName)
            }

            </ModalEditor>
        );
    }

    renderErrorModal = () => {
        const title = "Create Firewall Rule";
        const buttonLabel = "Create";

        return(
            <ModalEditor
                title={title}
                submitLabel={buttonLabel}
                open={this.state.opened}
                name={this.state.formName}
                onCancel={this.props.handleClose}
                configuration={this.postConfiguration}
                width='60%'
                errored={true}
            >
                { this.renderEditor() }
            </ModalEditor>
        );
    }

    render() {
        if (!showMessageBoxOnNoFlow({...this.props, toggleError: this.toggleError})) {
            return this.renderErrorModal();
        }
        return this.renderModal();
    }
}

CreateFlow.propTypes = {
    data: PropTypes.shape({}).isRequired,
    handleClose: PropTypes.func.isRequired,
}

export default CreateFlow;
