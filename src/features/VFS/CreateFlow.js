import React, { PropTypes } from 'react';
import ModalEditor from '../../components/Editor/ModalEditor';
import { required } from '../../components/Editor/utils';
import { TextInput, Select, Checkbox, Header } from '../../ui-components';
import { TwoColumnRow } from '../components';

import {
    getMetaDataAttribute,
    buildOptions,
    getNetworkItems,
} from './utils';

import {
    NetworkProtocols,
    getNetworkProtocolForValue,
    NetworkTypeOptions,
    SecurityPolicyActions,
    getSecurityPolicyActionsForValue,
    MirrorDestinationOptions,
    getMirrorDestinationForValue,
} from './NetworkData';
import {
    fetchAssociatedObjectIfNeeded,
    showMessageBoxOnNoFlow
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
    }

    componentWillMount() {
        this.initialize(this.props);
        this.setState({opened: true, formName: 'flow-editor'});
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
            changeFieldValue,
        ) => {
        const { getFieldError } = this.props;
        const mirrors = this.buildMirrorDestinations(mirrordestinations);
        const overlaymirrordestinationsField = this.buildOverlayMirrors(mirrordestinations, overlaymirrordestinations);

        const policyOptions = buildOptions(vfsPolicies);
        if (!policyOptions || !Array.isArray(policyOptions)) {

            if (vfsPolicies && vfsPolicies.isFetching) {
                return (<div>Fetching...</div>);
            }
            if (vfsPolicies && vfsPolicies.error) {
                this.toggleError(true);
                return vfsPolicies.error;
            }
            return <div>No Virtual Firewall Policies Available</div>;
        }
        this.toggleError(false);
        const srcList = this.buildSourceField(source);

        const destList = this.buildDestField(destination);

        const l7Apps = this.buildL7AppField(l7applicationsignatures);
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
                <TwoColumnRow firstColumnProps={{
                    name: 'locationType',
                    label: 'Source',
                    component: Select,
                    options: NetworkTypeOptions,
                    validate: [required],
                    error: getFieldError('locationType')
                }} secondColumnProps={{
                    name: 'networkType',
                    label: 'Destination',
                    component: Select,
                    options: NetworkTypeOptions,
                    validate: [required],
                    error: getFieldError('networkType')
                }} />
                { (srcList || destList) &&  <TwoColumnRow firstColumnProps={srcList} secondColumnProps={destList} /> }
                <TwoColumnRow secondColumnProps={{
                    name: 'destinationPort',
                    label: 'Destination Port',
                    component: TextInput
                }} />
                <TwoColumnRow firstColumnProps={{
                        name: 'protocol',
                        label: 'Protocol',
                        component: Select,
                        options: NetworkProtocols,
                        error: getFieldError('protocol')
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
                    options: MirrorDestinationOptions,
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
        } = props;
        if (operation !== 'add') {
            const domainID = getMetaDataAttribute(data, 'domainId');
            if (domainID) {
                fetchDomainFirewallPoliciesIfNeeded (domainID);
            }
            fetchAssociatedObjectIfNeeded({ type: 'associatedL7ApplicationSignatureID', ...props});
        }
    }

    validate = (values) => {
        const errorObject = {};
        const { description, locationType, destinationType, locationID, networkID, action, parentID } = values;
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
        return errorObject;
    }

    initialValues = (data) => {
        const actions = data && data.type ? getSecurityPolicyActionsForValue(data.type) : [];
        const protocol = getNetworkProtocolForValue(data.protocol);

        return ({
            protocol: protocol ? protocol : '6',
            locationType: 'ANY',
            networkType: 'ANY',
            action:  actions && Array.isArray(actions) && actions.length > 0 ? actions[0].value : 'FORWARD',
            destinationPort: data && data.destinationport ? data.destinationport : '*',
            sourcePort: '*',
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
        let mirrordestinations = null;
        if (mirrorDestinationTypeValue ) {
            mirrordestinations = {
                ...getNetworkItems(mirrorDestinationTypeValue, nextProps),
                type: mirrorDestinationTypeValue,
                ID: l2domainIDValue,
            }
            if (!mirrordestinations.data) {
                fetchAssociatedObjectIfNeeded({ type: mirrorDestinationTypeValue, ...nextProps});
            }
        }
        let overlaymirrordestinations = null;
        if (l2domainIDValue) {
            overlaymirrordestinations = {
                ...getNetworkItems('overlayMirrorDestinationID', nextProps),
            }
            if (!overlaymirrordestinations.data) {
                fetchAssociatedObjectIfNeeded({type: 'overlayMirrorDestinationID', ID: l2domainIDValue, ...nextProps});
            }
        }
    }

    toggleError = (flag) => {
        if (this.state.error !== flag ) {
            this.setState({ error: flag});
        }
    }

    renderModal = () => {
        const {
            data,
            vfpolicies,
            locationTypeValue,
            locationIDValue,
            networkTypeValue,
            networkIDValue,
            mirrorDestinationTypeValue,
            l2domainIDValue,
            parentIDValue,
        } = this.props;

        //associatedVirtualFirewallRuleID
        const title = "Create Firewall Rule";
        const buttonLabel = "Create";

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
                ...getNetworkItems('overlayMirrorDestinationID', this.props),
            }
        }
        const l7applicationsignatures = {
            ...getNetworkItems('associatedL7ApplicationSignatureID', this.props),
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
                parent={{resource: 'virtualfirewallpolicies', ID: parentIDValue}}
                resourceName='virtualfirewallrules'
                errored={this.state.error}
            >

            {
                this.renderEditor(vfpolicies, mirrordestinations, srcNetworkItems, destNetworkItems, overlaymirrordestinations, l7applicationsignatures)
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
