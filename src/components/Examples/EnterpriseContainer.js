import React from "react";
import { connect } from "react-redux";

import { Actions as MessageBoxActions } from "../MessageBox/redux/actions";
import { Actions as AppActions } from "../App/redux/actions";
import { Actions as ServiceActions, ActionKeyStore as ServiceActionKeyStore } from "../../services/servicemanager/redux/actions";

import { ServiceManager } from "../../services/servicemanager/index";


class EnterpriseContainerView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Enterprise ");

        var enterpriseID = this.props.params.enterpriseID;

        this.props.fetchEnterprise(enterpriseID);
        this.props.fetchDomains(enterpriseID);
    };

    render() {
        return (
            <div>
                <h1>List of domains of enterprise {this.props.enterprises ? this.props.enterprises[0].name : "loading"}</h1>

                {this.props.domains.map((domain) => {
                    return (<li key={domain.ID}>{domain.name}</li>)
                })}

            </div>
        );
    }
}


const mapStateToProps = (state, ownProps) => {
    const VSDService = ServiceManager.getService("VSD");

    return {
        domains: state.services.getIn([ServiceActionKeyStore.REQUESTS, VSDService.getRequestID({
            parentResource: "enterprises",
            parentID: ownProps.params.enterpriseID,
            resource: "domains"
        }), ServiceActionKeyStore.RESULTS]) || [],
        enterprises: state.services.getIn([ServiceActionKeyStore.REQUESTS, VSDService.getRequestID({
            parentResource: "enterprises",
            parentID: ownProps.params.enterpriseID,
        }), ServiceActionKeyStore.RESULTS])
    };
};


const actionCreators = (dispatch) => ({
    setPageTitle: function(title) {
        dispatch(AppActions.updateTitle(title));
    },
    showMessageBox: function(title, body) {
        dispatch(MessageBoxActions.toggleMessageBox(true, title, body));
    },
    fetchDomains: function(enterpriseID) {
        dispatch(ServiceActions.fetch({
            parentResource: "enterprises",
            parentID: enterpriseID,
            resource: "domains"
        },
        "VSD"
        ));
    },
    fetchEnterprise: function(enterpriseID) {
        dispatch(ServiceActions.fetch({
            parentResource: "enterprises",
            parentID: enterpriseID,
        },
        "VSD"
        ));
    }
 });


export default connect(mapStateToProps, actionCreators)(EnterpriseContainerView);
