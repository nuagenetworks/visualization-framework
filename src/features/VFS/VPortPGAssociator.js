import React, { Component } from 'react';
import PropTypes from 'prop-types';

import ModalEditor from '../../components/Editor/ModalEditor';
import {Select, Form, Label} from '../../ui-components';

import {
    buildOptions,
    getDomainID,
    getMetaDataAttribute,
} from './utils';
import {
    getFormNameBasedOnOperation,
    getNetworkItems,
    NetworkObjectTypes,
    showMessageBoxOnNoFlow
} from "./actions";

class VPortPGAssociator extends Component {
    state = {
        opened: false,
        error: false,
        direction: null,
    }
    constructor(...props) {
        super(...props);
        this.initialize(props);
    }

    initialize = (props) => {
        const {
            data,
            fetchPGsIfNeeded,
            resourceName,
            query
        } = props;
        let { direction } = query ? query : {};
        const flows = data && Array.isArray(data) ? data : [data];
        if (!direction && flows.length === 1) {
            direction = getMetaDataAttribute(data, 'direction');
        }
        if (direction) {
            this.setState({direction});
        }
        const domainID = getDomainID(resourceName, flows[0]);
        if (domainID) {
            fetchPGsIfNeeded (domainID, resourceName);
        }
    }

    componentWillMount() {
        this.initialize(this.props);
        this.setState({opened: true, formName: getFormNameBasedOnOperation(this.props)});
    }

    componentWillReceiveProps(nextProps) {
        if (!this.state.direction) {
            const {
                data,
                query
            } = nextProps;
            let { direction } = query ? query : {};
            const flows = data && Array.isArray(data) ? data : [data];
            if (!direction && flows.length === 1) {
                direction = getMetaDataAttribute(data, 'direction');
            }
            if (direction) {
                this.setState({direction});
            }
        }
    }

    getSelectedVPorts = (props) => {
        const { data } = props;
        let flows = (data && Array.isArray(data) ? data : [data]);
        if (this.state.direction) {
            flows = flows.filter(item => getMetaDataAttribute(item, 'direction') === this.state.direction);
        }
        const vports = new Set(flows.map(item => getMetaDataAttribute(item, 'vportId')));
        return Array.from(vports);
    }

    initialValues = () => ({vports: this.getSelectedVPorts(this.props)})

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

    serviceConfiguration = () => {
        const { IDValue } = this.props;
        return {
            service: "VSD",
            query: {
                parentResource: "policygroups",
                parentID: IDValue,
                resource: "vports"
            },
            action: 'ADD',
        }
    }
    validate = (values) => {
        const errorObject = {};
        const { ID } = values;
        if (!ID) {
            errorObject.ID = "Please select a valid Policy Group from the list";
        }
        return errorObject;
    }

    handleSelectRule = (evt) => {
        const { preventDefault, ...values } = evt;
        const ID = values ? Object.values(values).join('') : null;
        if (ID) {
            const vports = this.getSelectedVPorts(this.props);
            const { selectRule } = this.props;
            if (vports && vports.length > 0 && selectRule) {
                selectRule(ID, vports);
            }
        }
    }

    getPGS = (props) => {
        const flow = props.data && Array.isArray(props.data) ? props.data[0] : props.data;
        const pgs = getNetworkItems(NetworkObjectTypes.POLICYGROUP, {...props, data: flow});
        if (pgs && pgs.data && pgs.data.length) {
            const data = pgs.data.filter(item => item.templateID === null);
            pgs.data = data;
        }
        return pgs;
    }

    renderModal = (props) => {
        const title = "Associate VPorts to PGs";
        const buttonLabel = "Associate";
        const pgs = this.getPGS(props);
        const vports = this.getSelectedVPorts(props);
        const direction = this.state.direction === 'ingress' ? 'source' : this.state.direction === 'egress' ? 'destination' : '';
        const vportsMsg = vports.length;
        return(
            <ModalEditor
                title={title}
                submitLabel={buttonLabel}
                open={this.state.opened}
                name={this.state.formName}
                onCancel={this.props.handleClose}
                width='60%'
                onValidate={this.validate}
                getInitialValues={() => this.initialValues(props.data)}
                configuration={this.serviceConfiguration.bind(this)}
                errored={this.state.error}
                onDone={this.handleDone}
            >
                <span>{`Adding ${vportsMsg} ${direction} VPorts to PG`}</span>
                <Label>Policy Group</Label>
                <Form.Field
                    name='ID'
                    label='Policy Group'
                    component={Select}
                    options={buildOptions(pgs)}
                    onChange={this.handleSelectRule}
                />
            </ModalEditor>
        );
    }

    hasPGs = (props) => {
        const pgs = this.getPGS(props);
        return pgs && pgs.data && pgs.data.length > 0;
    }

    renderErrorModal = (props) => {
        const title = "Associate VPorts to PGs";
        const buttonLabel = "Associate";
        const vports = this.getSelectedVPorts(props);
        const errorMsg = !this.hasPGs(props) ? "No Policy Groups found for the domain" :
            vports && vports.length > 0 ? "Unknown Error" : "Please Select flows with valid VPorts";
        return(
            <ModalEditor
                title={title}
                submitLabel={buttonLabel}
                open={this.state.opened}
                name={this.state.formName}
                onCancel={this.props.handleClose}
                configuration={this.serviceConfiguration.bind(this)}
                width='60%'
                errored={true}
            >
                <span>{errorMsg}</span>
            </ModalEditor>
        );
    }

    render() {
        if (!showMessageBoxOnNoFlow({...this.props, toggleError: this.toggleError}) || !this.hasPGs(this.props)) {
            return this.renderErrorModal(this.props);
        }
        return this.renderModal(this.props);
    }
}

VPortPGAssociator.defaultProps = {
    operation: null,
}

VPortPGAssociator.propTypes = {
    operation: PropTypes.string,
    data: PropTypes.oneOf(PropTypes.arrayOf(PropTypes.shape({})), PropTypes.shape({})).isRequired,
    parentQuery: PropTypes.shape({}).isRequired,
    parentPath: PropTypes.string.isRequired,
}

export default VPortPGAssociator;