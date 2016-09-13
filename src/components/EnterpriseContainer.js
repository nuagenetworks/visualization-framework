import React from "react";
import { connect } from "react-redux";

import { Actions as MessageBoxActions } from "./MessageBox/redux/actions"
import { Actions as ComponentActions } from "./redux/actions";
import { Actions as VSDActions, ActionKeyStore as VSDActionKeyStore } from "../configs/nuage/redux/actions";

class DomainContainerView extends React.Component {

    componentWillMount() {
        var enterpriseID = this.props.params.enterpriseID;

        this.props.fetchEnterprise(enterpriseID);
        this.props.setPageTitle("Enterprise " + enterpriseID);
        this.props.fetchDomains(enterpriseID);
    };

    render() {
        return (
            <div>
                <h1>List of domains</h1>

                {this.props.domains.map((domain) => {
                    return (<li key={domain.ID}>{domain.name}</li>)
                })}

            </div>
        );
    }
}


const mapStateToProps = (state) => ({
    domains: state.VSD.get(VSDActionKeyStore.KEY_STORE_RESULTS)
});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(ComponentActions.updateTitle(aTitle));
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
