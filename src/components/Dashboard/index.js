import React from "react";
import { connect } from "react-redux";

import CircularProgress from "material-ui/CircularProgress";
import ReactGridLayout from "react-grid-layout";
import AppBar from "material-ui/AppBar";

import { Actions as AppActions } from "../App/redux/actions";
import { Actions as DashboardActions, ActionKeyStore as DashboardActionKeyStore } from "../../services/dashboards/redux/actions"

import "./Dashboard.css"
import graph1 from "../../images/graph1.png"
import graph2 from "../../images/graph2.png"
import graph3 from "../../images/graph3.png"
import graph4 from "../../images/graph4.png"


export class DashboardView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.props.fetchDashboardConfiguration(this.props.params.dashboardID);
    };

    getGraph(name) {
        switch(name) {
            case "graph1":
                return graph1;
            case "graph2":
                return graph2;
            case "graph3":
                return graph3;
            case "graph4":
            default:
                return graph4;
        }
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
            let { title, data } = this.props.configuration.toJS();
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
                            <AppBar
                                title={item.title}
                                showMenuIconButton={false}
                                />
                            <div>
                                <img src={this.getGraph(item.i)} alt={item.title} width="100%" height="100%" />
                            </div>
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
        DashboardActionKeyStore.DASHBOARDS,
        ownProps.params.dashboardID,
        DashboardActionKeyStore.DATA
    ]),

    fetching: state.dashboards.getIn([
        DashboardActionKeyStore.DASHBOARDS,
        ownProps.params.dashboardID,
        DashboardActionKeyStore.IS_FETCHING
    ]),

    error: state.dashboards.getIn([
        DashboardActionKeyStore.DASHBOARDS,
        ownProps.params.dashboardID,
        DashboardActionKeyStore.ERROR
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
