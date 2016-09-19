import React from "react";
import { connect } from "react-redux";

import { Actions as MessageBoxActions } from "../MessageBox/redux/actions";
import { Actions as AppActions } from "../App/redux/actions";
import { Actions as VSDActions, ActionKeyStore as VSDActionKeyStore } from "../../configs/nuage/redux/actions";

import { getRequestID } from "../../configs/nuage/vsd";


class DomainContainerView extends React.Component {

    componentWillMount() {
        this.props.setUserToken(this.props.location.query.token);
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
    domains: state.VSD.getIn([VSDActionKeyStore.ALL_REQUESTS, getRequestID("enterprises", ownProps.params.enterpriseID, "domains"), VSDActionKeyStore.RESULTS]) || [],
    enterprises: state.VSD.getIn([VSDActionKeyStore.ALL_REQUESTS, getRequestID("enterprises", ownProps.params.enterpriseID), VSDActionKeyStore.RESULTS])
});


const actionCreators = (dispatch) => ({
    setUserToken: function(aToken) {
        dispatch(VSDActions.setUserToken(aToken));
    },
    setPageTitle: function(aTitle) {
        dispatch(AppActions.updateTitle(aTitle));
    },
    showMessageBox: function(title, body) {
        dispatch(MessageBoxActions.toggleMessageBox(true, title, body));
    },
    fetchDomains: function(enterpriseID) {
        dispatch(VSDActions.fetch("enterprises", enterpriseID, "domains"));
    },
    fetchEnterprise: function(enterpriseID) {
        dispatch(VSDActions.fetch("enterprises", enterpriseID));
    }
 });


export default connect(mapStateToProps, actionCreators)(DomainContainerView);
