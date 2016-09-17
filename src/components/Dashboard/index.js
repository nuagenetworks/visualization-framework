import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import CircularProgress from 'material-ui/CircularProgress';

import { Actions as AppActions } from "../App/redux/actions";
import { Actions as DashboardActions, ActionKeyStore as DashboardActionKeyStore } from "../../utils/dashboards/redux/actions"

class DashboardView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.props.fetchDashboardConfiguration(this.props.params.dashboardID);
    };

    render() {
        return (
            <div>
                <p>
                    This dashboard component is loading the configuration file...
                </p>
                {(() => {
                    if (this.props.error)
                        return <div>this.props.error</div>

                    if (this.props.configuration) {
                        let configuration = this.props.configuration.toJS();
                        return <div>#{configuration.id} - {configuration.title}</div>
                    }

                    return <CircularProgress color="#eeeeee"/>
                })()}
            </div>
        );
    }
}


const mapStateToProps = (state, ownProps) => ({

    configuration: state.dashboards.getIn([
        DashboardActionKeyStore.KEY_STORE_DASHBOARDS,
        ownProps.params.dashboardID,
        DashboardActionKeyStore.KEY_STORE_DATA
    ]),

    fetching: state.dashboards.getIn([
        DashboardActionKeyStore.KEY_STORE_DASHBOARDS,
        ownProps.params.dashboardID,
        DashboardActionKeyStore.KEY_STORE_IS_FETCHING
    ]),

    error: state.dashboards.getIn([
        DashboardActionKeyStore.KEY_STORE_DASHBOARDS,
        ownProps.params.dashboardID,
        DashboardActionKeyStore.KEY_STORE_ERROR
    ])
});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(AppActions.updateTitle(aTitle));
    },
    fetchDashboardConfiguration: function(dashboardID) {
        dispatch(DashboardActions.fetch(dashboardID));
    }
 });


export default connect(mapStateToProps, actionCreators)(DashboardView);
