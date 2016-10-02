import React from "react";
import { connect } from "react-redux";

import CircularProgress from "material-ui/CircularProgress";
import ReactGridLayout from "react-grid-layout";

import Visualization from "../Visualization";

import { Actions as AppActions } from "../App/redux/actions";

import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions"

import "./Dashboard.css"


export class DashboardView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.updateConfiguration();
    }

    componentDidUpdate(prevProps) {
        this.updateTitleIfNecessary(prevProps);
        this.updateConfiguration();
    }

    shouldUpdateTitle(prevProps){
        if(!prevProps.configuration) {
            return true;
        } else {
            return (
                this.props.configuration.get("title")
                !==
                prevProps.configuration.get("title")
            );
        }
    }

    updateTitleIfNecessary(prevProps) {
        if(!this.props.configuration)
            return;
        if(this.shouldUpdateTitle(prevProps)){
            this.props.setPageTitle(this.props.configuration.get("title"));
        }
    }

    updateConfiguration() {
        const { params, fetchConfigurationIfNeeded } = this.props;

        // It seems we are enforced to define callbacks. Otherwise, we will end up with Uncaught (in promise) error.
        fetchConfigurationIfNeeded(params.id).then(
            () => {},
            () => {}
        );
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
            const { visualizations } = this.props.configuration.toJS();

            // Expose each visualization id as the property "i",
            // which is required by the ReactGridLayout "layout" prop.
            const layout = visualizations.map((visualization) => {
                return Object.assign({}, visualization, {
                    i: visualization.id
                });
            });

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
                                <Visualization id={visualization.id} context={this.props.location.query} />
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
    fetchConfigurationIfNeeded: function(id) {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.DASHBOARDS
        ));
    }
});


export default connect(mapStateToProps, actionCreators)(DashboardView);
