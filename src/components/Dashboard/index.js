import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import CircularProgress from "material-ui/CircularProgress";
import ReactGridLayout from "react-grid-layout";

import { Actions as AppActions } from "../App/redux/actions";
import { Actions as DashboardActions, ActionKeyStore as DashboardActionKeyStore } from "../../utils/dashboards/redux/actions"

class DashboardView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.props.fetchDashboardConfiguration(this.props.params.dashboardID);
    };

    render() {
        if (this.props.fetching) {
            return <p>
                <CircularProgress color="#eeeeee"/>
                This dashboard component is loading the configuration file...
            </p>
        } else if (this.props.error) {
            return <div>{this.props.error}</div>
        } else if (this.props.configuration) {
            let { id, title, data } = this.props.configuration.toJS();
            let { layout } = data;

            this.props.setPageTitle(title);

            return (
                <ReactGridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={10}
                    width={1200}
                    >
                    {layout.map((item) => {
                        return <div key={item.i}>
                            {item.i}
                        </div>
                    })}
                </ReactGridLayout>
            );
        } else {
            return <div>Unhandled case</div>
        }
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
