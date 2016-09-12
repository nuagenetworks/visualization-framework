import React from "react";
import { connect } from "react-redux";

import { getAll } from "../configs/nuage/vsd";

import { Actions as MessageBoxActions } from "./MessageBox/redux/actions"
import { Actions as ComponentActions } from "./redux/actions";

class DomainContainerView extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            domains: []
        };
    }

    componentWillMount() {
        this.updateTitle(this.props.params.enterpriseID);
        this.loadDomains(this.props.params.enterpriseID);
    };

    componentWillReceiveProps(nextProps) {
        this.updateTitle(nextProps.params.enterpriseID);
        this.loadDomains(nextProps.params.enterpriseID);
    }

    updateTitle(enterpriseID) {
        this.props.setPageTitle("Enterprise " + enterpriseID);
    }

    loadDomains(enterpriseID) {
        let view = this;
        getAll("enterprises", enterpriseID, "domains").then(function (response) {
            console.error(response);
            view.setState({domains: response});

        }, function (error) {
            console.error(error);
            view.setState({domains: []});
            view.props.showMessageBox("Ooops, something went wrong !", "It seems the cannot access the REST API to retrieve all domains");
        });
    }

    render() {
        return (
            <div>
                <h1>List of domains</h1>

                {this.state.domains.map((domain) => {
                    return (<li key={domain.ID}>{domain.name}</li>)
                })}
            </div>
        );
    }
}


const mapStateToProps = (state) => ({

});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(ComponentActions.updateTitle(aTitle));
    },
    showMessageBox: function(title, body) {
        console.error(title);
        dispatch(MessageBoxActions.toggleMessageBox(true, title, body));
    },
 });


export default connect(mapStateToProps, actionCreators)(DomainContainerView);
