import React from "react";
import { connect } from "react-redux";

import { Actions as MessageBoxActions } from "../MessageBox/redux/actions";
import { Actions as AppActions } from "../App/redux/actions";
import { Actions as VSDActions, ActionKeyStore as VSDActionKeyStore } from "../../configs/nuage/redux/actions";

import { getRequestID } from "../../configs/nuage/vsd";


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


const mapStateToProps = (state, ownProps) => ({
    domains: state.VSD.getIn([VSDActionKeyStore.REQUESTS, getRequestID("enterprises", ownProps.params.enterpriseID, "domains"), VSDActionKeyStore.RESULTS]) || [],
    enterprises: state.VSD.getIn([VSDActionKeyStore.REQUESTS, getRequestID("enterprises", ownProps.params.enterpriseID), VSDActionKeyStore.RESULTS])
});


const actionCreators = (dispatch) => ({
    setPageTitle: function(title) {
        dispatch(AppActions.updateTitle(title));
    },
    showMessageBox: function(title, body) {
        dispatch(MessageBoxActions.toggleMessageBox(true, title, body));
    },
    fetchEnterprise: function (enterpriseID) {
        dispatch(VSDActions.fetch("enterprises", enterpriseID));
    },
    fetchDomains: function (enterpriseID) {
        dispatch(VSDActions.fetch("enterprises", enterpriseID, "domains"));
    }
 });


export default connect(mapStateToProps, actionCreators)(EnterpriseContainerView);
