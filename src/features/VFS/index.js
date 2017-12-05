import React, { PropTypes } from 'react';
import { connect } from 'react-redux';
import ModalEditor from '../../components/Editor/ModalEditor';
import { required } from '../../components/Editor/utils';
import { Form, TextInput, Label, Columns, Select, Checkbox, Header } from '../../ui-components';
import {
    NetworkProtocols,
    getNetworkProtocolForValue,
    NetworkTypeOptions,
    getNetworkTypeForValue,
    SecurityPolicyActions,
    getSecurityPolicyActionsForValue,
    MirrorDestinationOptions,
    getMirrorDestinationForValue,
} from './NetworkData';
import { mapStateToProps, actionCreators } from './actions';

const twoColumnRow = (col1, col2) => {
    const col = { name: null, label: null, component: null};
    const { name: nameCol1, label: labelCol1, component: componentCol1, text: textCol1, ...restCol1 } = col1 ? col1 : col;
    const { name: nameCol2, label: labelCol2, component: componentCol2, text: textCol2, ...restCol2 } = col2 ? col2 : col;
    const displayLabelCol1 = col1 && labelCol1 && !col1.hideLabel;
    const displayLabelCol2 = col2 && labelCol2 && !col2.hideLabel;
    return (
        <Columns>
            <Columns.Column width="15%">
                {displayLabelCol1 && <Label>{labelCol1}</Label>}
            </Columns.Column>
            <Columns.Column width="32%">
                { col1 && !textCol1 && col1.component &&
                    <Form.Field
                        name={nameCol1}
                        label={labelCol1}
                        component={componentCol1}
                        {...restCol1}
                    />
                }
                { col1 && textCol1 &&
                    <div>{textCol1}</div>
                }
            </Columns.Column>
            <Columns.Column width="6%"/>
            <Columns.Column width="15%">
                {displayLabelCol2 && <Label>{labelCol2}</Label>}
            </Columns.Column>
            <Columns.Column width="32%">
                { col2 && !textCol2 && componentCol2 &&
                    <Form.Field
                        name={nameCol2}
                        label={labelCol2}
                        component={componentCol2}
                        {...restCol2}
                    />
                }
                { col2 && textCol2 &&
                    <div>{textCol2}</div>
                }
            </Columns.Column>
        </Columns>
    )
};

const buildOptions = (options) => {
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

class VFS extends React.Component {
    constructor(...props) {
        super(...props);

        this.state = {
            opened: false,
            error: false,
        }

        this.handleClose = this.handleClose.bind(this);
        this.resetFieldsOnChange = this.resetFieldsOnChange.bind(this);
    }

    componentWillMount() {
        this.initialize(this.props);
        this.setState({opened: true});
    }

    resetFieldsOnChange = (value, ...fields) => {
        const { changeFieldValue } = this.props;
        const formName = 'flow-editor';
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
            const srcLabel = getNetworkTypeForValue(source.type);
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
            const destLabel = getNetworkTypeForValue(destination.type);
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
                <Label>Virtual Firewall Policy</Label>
                <Form.Field
                    name="parentID"
                    component={Select}
                    options={policyOptions}
                    error={getFieldError("parentID")}
                />
                {
                    twoColumnRow({
                        name: 'description',
                        label: 'Name',
                        component: TextInput,
                        validate: [required],
                    }, {
                        name: 'priority',
                        label: 'Priority',
                        component: TextInput,
                        error: getFieldError('priority')
                    })
                }
                <Header>Match Criteria</Header>
                {twoColumnRow({
                    name: 'locationType',
                    label: 'Source',
                    component: Select,
                    options: NetworkTypeOptions,
                    validate: [required],
                    error: getFieldError('locationType')
                }, {
                    name: 'networkType',
                    label: 'Destination',
                    component: Select,
                    options: NetworkTypeOptions,
                    validate: [required],
                    error: getFieldError('networkType')
                })}
                { (srcList || destList) &&  twoColumnRow(srcList, destList) }
                {
                    twoColumnRow(null, {
                        name: 'destinationPort',
                        label: 'Destination Port',
                        component: TextInput
                    })
                }
                {
                    twoColumnRow({
                        name: 'protocol',
                        label: 'Protocol',
                        component: Select,
                        options: NetworkProtocols,
                        error: getFieldError('protocol')
                    }, l7Apps)
                }
                <Header>Actions</Header>
                {
                    twoColumnRow({
                        name: 'action',
                        label: 'Action',
                        component: Select,
                        options: SecurityPolicyActions
                    }, {
                        name: 'mirrorDestinationType',
                        label: "Mirror Destination Type",
                        component: Select,
                        options: MirrorDestinationOptions,
                        onChange: (e) => this.resetFieldsOnChange(e, 'overlayMirrorDestinationID', 'mirrorDestinationID', 'l2domainID')
                    })
                }
                {
                    twoColumnRow(null,mirrors)
                }
                {
                    overlaymirrordestinationsField && twoColumnRow(null,overlaymirrordestinationsField)
                }
                {
                    twoColumnRow({
                        name: 'flowLoggingEnabled',
                        label: 'Enable Flow Logging',
                        hideLabel: true,
                        component: Checkbox
                    }, {
                        name: 'statsLoggingEnabled',
                        label: 'Enable statistics collection',
                        hideLabel: true,
                        component: Checkbox
                    })
                }

            </div>
        );
    }

    getEnterpriseID = () => {
        const {
            data,
            query,
            context
        } = this.props;

        let enterpriseID = this.getMetaDataAttribute(data, 'enterpriseId');
        if (!enterpriseID && query) {
            enterpriseID = query.enterpriseID;
        }
        if (!enterpriseID && context) {
            enterpriseID = context.enterpriseID ? context.enterpriseID : context.enterpriseId;
        }
        return enterpriseID;
    }

    fetchAssociatedObjectIfNeeded = (type, ID) => {
        const {
            data,
            fetchSubnetsIfNeeded,
            fetchZonesIfNeeded,
            fetchPGsIfNeeded,
            fetchPGExpressionsIfNeeded,
            fetchNetworkMacroGroupsIfNeeded,
            fetchNetworkMacrosIfNeeded,
            fetchMirrorDestinationsIfNeeded,
            fetchL2DomainsIfNeeded,
            fetchOverlayMirrorDestinationsIfNeeded,
            fetchL7ApplicationSignaturesIfNeeded,
        } = this.props;
        const enterpriseID = this.getEnterpriseID();
        const domainID = this.getMetaDataAttribute(data, 'domainId');

        switch (type) {
            case 'ZONE':
                fetchZonesIfNeeded(domainID);
                break;
            case 'SUBNET':
                fetchSubnetsIfNeeded(domainID);
                break;
            case 'POLICYGROUP':
                fetchPGsIfNeeded(domainID);
                break;
            case 'PGEXPRESSION':
                fetchPGExpressionsIfNeeded(domainID);
                break;
            case 'ENTERPRISE_NETWORK':
                fetchNetworkMacrosIfNeeded(enterpriseID);
                break;
            case 'NETWORK_MACRO_GROUP':
                fetchNetworkMacroGroupsIfNeeded(enterpriseID);
                break;
            case 'l2domainID':
                fetchL2DomainsIfNeeded(enterpriseID);
                break;
            case 'mirrorDestinationID':
                fetchMirrorDestinationsIfNeeded();
                break;
            case 'overlayMirrorDestinationID':
                fetchOverlayMirrorDestinationsIfNeeded(ID);
                break;
            case 'associatedL7ApplicationSignatureID':
                fetchL7ApplicationSignaturesIfNeeded(enterpriseID);
                break;
            default:

        }
    }

    initialize = (props) => {
        const {
            data,
            fetchDomainFirewallPoliciesIfNeeded,
        } = props;
        const domainID = this.getMetaDataAttribute(data, 'domainId');
        if (domainID) {
            fetchDomainFirewallPoliciesIfNeeded (domainID);
        }
        this.fetchAssociatedObjectIfNeeded('associatedL7ApplicationSignatureID');
    }

    validate = (values) => {
        const errorObject = {};
        const { description, locationID, networkID, action, parentID } = values;
        if (!description) {
            errorObject.description = "Policy Rule name is required";
        }
        if (!locationID) {
            errorObject.locationID = "Please select a valid origin location";
        }
        if (!networkID) {
            errorObject.networkID = "Please select a valid destination network";
        }
        if (!action) {
            errorObject.action = "Please select a valid action";
        }
        if (!parentID) {
            errorObject.parentID = "Please select a valid virtual firewall policy";
        }
        return errorObject;
    }

    getMetaDataAttribute = (data, attrName) => data && data.hasOwnProperty("nuage_metadata") ? data.nuage_metadata[attrName] : null;

    getNetworkItems = (type) => {
        const {
            zones,
            subnets,
            policygroups,
            pgexpressions,
            enterprisenetworks,
            networkmacrogroups,
            l2domains,
            mirrordestinations,
            overlaymirrordestinations,
            l7applicationsignatures,
        } = this.props;
        switch (type) {
            case 'ZONE':
                return zones;
            case 'SUBNET':
                return subnets;
            case 'POLICYGROUP':
                return policygroups;
            case 'PGEXPRESSION':
                return pgexpressions;
            case 'ENTERPRISE_NETWORK':
                return enterprisenetworks;
            case 'NETWORK_MACRO_GROUP':
                return networkmacrogroups;
            case 'l2domainID':
                return l2domains;
            case 'mirrorDestinationID':
                return mirrordestinations;
            case 'overlayMirrorDestinationID':
                return overlaymirrordestinations;
            case 'associatedL7ApplicationSignatureID':
                return l7applicationsignatures;
            default:
                return null;
        }
    }

    handleClose = (params) => {
        this.setState({opened: false});
        const { parentPath, parentQuery, goTo, context } = this.props;
        if (parentPath && parentQuery) {
            goTo(parentPath, parentQuery);
        }
        else {
            const query = context ? Object.assign({}, context) : null;

            goTo(`${process.env.PUBLIC_URL}/dashboards/vssDomainFlowExplorer`, query);
        }
    }
    initialValues = (data) => {
        const actions = data && data.type ? getSecurityPolicyActionsForValue(data.type) : [];
        const protocols = data && data.protocol ? getNetworkProtocolForValue(data.protocol) : [];

        return ({
            protocol: protocols && Array.isArray(protocols) && protocols.length > 0 ? protocols[0].value : '6',
            locationType: 'ANY',
            networkType: 'ANY',
            action:  actions && Array.isArray(actions) && actions.length > 0 ? actions[0].value : 'FORWARD',
            destinationPort: data && data.destinationport ? data.destinationport : '*',
            priority: '0',
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
            ...this.getNetworkItems(locationTypeValue),
            type: locationTypeValue,
            ID: locationIDValue,
        };
        const destNetworkItems = {
            ...this.getNetworkItems(networkTypeValue),
            type: networkTypeValue,
            ID: networkIDValue,
        };
        if (!srcNetworkItems.data) {
            this.fetchAssociatedObjectIfNeeded(locationTypeValue);
        }
        if (!destNetworkItems.data) {
            this.fetchAssociatedObjectIfNeeded(networkTypeValue);
        }
        let mirrordestinations = null;
        if (mirrorDestinationTypeValue ) {
            mirrordestinations = {
                ...this.getNetworkItems(mirrorDestinationTypeValue),
                type: mirrorDestinationTypeValue,
                ID: l2domainIDValue,
            }
            if (!mirrordestinations.data) {
                this.fetchAssociatedObjectIfNeeded(mirrorDestinationTypeValue);
            }
        }
        let overlaymirrordestinations = null;
        if (l2domainIDValue) {
            overlaymirrordestinations = {
                ...this.getNetworkItems('overlayMirrorDestinationID'),
            }
            if (!overlaymirrordestinations.data) {
                this.fetchAssociatedObjectIfNeeded('overlayMirrorDestinationID', l2domainIDValue);
            }
        }
    }

    showMessageBoxOnNoFlow = () => {
        const { data, showMessageBox } = this.props;

        if (!data || Object.getOwnPropertyNames(data).length <= 0) {
            const body = () =>
                <span style={{ display: 'inline-flex', color: 'blue', fontSize: 12, padding: 20 }}>Select first a flow to use for creating a new Virtual Firewall Rule</span>;

            showMessageBox('No flow selected', body());
            this.toggleError(true);
            return false;
        }
        return true;
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
            ...this.getNetworkItems(locationTypeValue),
            type: locationTypeValue,
            ID: locationIDValue,
        };
        const destNetworkItems = {
            ...this.getNetworkItems(networkTypeValue),
            type: networkTypeValue,
            ID: networkIDValue,
        };
        let mirrordestinations = null;
        if (mirrorDestinationTypeValue ) {
            mirrordestinations = {
                ...this.getNetworkItems(mirrorDestinationTypeValue),
                type: mirrorDestinationTypeValue,
                ID: l2domainIDValue,
            }
        }
        let overlaymirrordestinations = null;
        if (l2domainIDValue) {
            overlaymirrordestinations = {
                ...this.getNetworkItems('overlayMirrorDestinationID'),
            }
        }
        const l7applicationsignatures = {
            ...this.getNetworkItems('associatedL7ApplicationSignatureID'),
        }

        return(
            <ModalEditor
                title={title}
                submitLabel={buttonLabel}
                open={this.state.opened}
                name='flow-editor'
                onCancel={this.handleClose}
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
                name='flow-editor'
                onCancel={this.handleClose}
                width='60%'
                errored={true}
            >
                { this.renderEditor() }
            </ModalEditor>
        );
    }

    render() {
        if (!this.showMessageBoxOnNoFlow()) {
            return this.renderErrorModal();
        }
        return this.renderModal();
    }
}

VFS.propTypes = {
    data: PropTypes.shape({}).isRequired,
    parentQuery: PropTypes.shape({}).isRequired,
    parentPath: PropTypes.string.isRequired,
}

export default connect(mapStateToProps, actionCreators)(VFS);
