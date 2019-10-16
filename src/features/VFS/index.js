import React from 'react';
import PropTypes from 'prop-types';

import { connect } from 'react-redux';
import AddToFlowEditor from './AddToFlowEditor';
import CreateFlow from './CreateFlow';
import VPortPGAssociator from "./VPortPGAssociator";

import {
    mapStateToProps,
    actionCreators,
 } from './actions';

class VFS extends React.Component {
    constructor(...props) {
        super(...props);

        this.state = {
            opened: false,
            error: false,
        }

        this.handleClose = this.handleClose.bind(this);
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

    shouldComponentUpdate(nextProps, nextState) {
        const { data } = nextProps;

        const { error } = nextState;

        if (!data || Object.getOwnPropertyNames(data).length <= 0 || error) {
            return false;
        }

        return nextProps !== this.props || this.state !== nextState;
    }

    render() {
        const { operation } = this.props;

        switch (operation) {
            case 'add':
                return <AddToFlowEditor handleClose={this.handleClose} {...this.props} />;
            case 'create':
                return <CreateFlow handleClose={this.handleClose} {...this.props} />;
            case 'associate':
                return <VPortPGAssociator handleClose={this.handleClose} {...this.props}/>
        }
    }
}

VFS.defaultProps = {
    operation: null,
}

VFS.propTypes = {
    operation: PropTypes.string,
    data: PropTypes.shape({}).isRequired,
    parentQuery: PropTypes.shape({}).isRequired,
    parentPath: PropTypes.string.isRequired,
}

export default connect(mapStateToProps, actionCreators)(VFS);
