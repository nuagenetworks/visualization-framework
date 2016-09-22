import React from "react";
import { connect } from "react-redux";

import CircularProgress from "material-ui/CircularProgress";
import ReactGridLayout from "react-grid-layout";

import Visualization from "../Visualization";

import { Actions as AppActions } from "../App/redux/actions";
import { Actions as ConfigurationsActions, ActionKeyStore as ConfigurationsActionKeyStore } from "../../services/configurations/redux/actions"

import { splatToContext } from "../../utils/urls"

import "./Dashboard.css"


export class DashboardView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.loadConfiguration(this.props.params.id);
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.params.id !== nextProps.params.id)
            this.loadConfiguration(nextProps.params.id)
    }

    loadConfiguration(id) {
        this.props.fetchDashboardConfiguration(id);
    }

    render() {
        if (this.props.fetching) {
            return (
                <div>
                    <CircularProgress color="#eeeeee"/>
                    This dashboard component is loading the configuration file...
                </div>
            );

        } else if (this.props.error) {
            return (
                <div>{this.props.error}</div>
            );

        } else if (this.props.configuration) {
            const { title, visualizations } = this.props.configuration.toJS();

            this.props.setPageTitle(title);

            // Expose each visualization id as the property "i",
            // which is required by the ReactGridLayout "layout" prop.
            const layout = visualizations.map((visualization) => {
              return Object.assign({}, visualization, {
                i: visualization.id
              });
            });

            const context = splatToContext(this.props.params.splat);

            return (
                <ReactGridLayout
                    className="layout"
                    layout={layout}
                    cols={12}
                    rowHeight={10}
                    width={1200}
                    >
                    {
                        visualizations.map((visualization) =>
                            <div key={visualization.id}>
                                <Visualization
                                    id={visualization.id}
                                    context={context}
                                    />
                            </div>
                        )
                    }
                </ReactGridLayout>
            );
        } else {
            return <div>Unhandled case</div>
        }
    }
}


const mapStateToProps = (state, ownProps) => ({

    configuration: state.configurations.getIn([
        ConfigurationsActionKeyStore.DASHBOARDS,
        ownProps.params.id,
        ConfigurationsActionKeyStore.DATA
    ]),

    fetching: state.configurations.getIn([
        ConfigurationsActionKeyStore.DASHBOARDS,
        ownProps.params.id,
        ConfigurationsActionKeyStore.IS_FETCHING
    ]),

    error: state.configurations.getIn([
        ConfigurationsActionKeyStore.DASHBOARDS,
        ownProps.params.id,
        ConfigurationsActionKeyStore.ERROR
    ])
});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(AppActions.updateTitle(aTitle));
    },
    fetchDashboardConfiguration: function(id) {
        dispatch(ConfigurationsActions.fetch(
            id,
            ConfigurationsActionKeyStore.DASHBOARDS
        ));
    },
 });


export default connect(mapStateToProps, actionCreators)(DashboardView);
