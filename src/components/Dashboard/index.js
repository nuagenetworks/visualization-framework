import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import { Actions } from "./redux/actions";

class DashboardView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
    };

    render() {
        return (
            <div>This is the dashboard component !</div>
        );
    }
}


const mapStateToProps = (state) => ({

});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    },
    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    }
 });


export default connect(mapStateToProps, actionCreators)(DashboardView);
