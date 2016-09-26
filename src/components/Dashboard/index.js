import React from "react";
import { connect } from "react-redux";

import CircularProgress from "material-ui/CircularProgress";
import ReactGridLayout from "react-grid-layout";

import Visualization from "../Visualization";

import { Actions as AppActions } from "../App/redux/actions";
import { Actions as ConfigurationsActions, ActionKeyStore as ConfigurationsActionKeyStore } from "../../services/configurations/redux/actions"

import "./Dashboard.css"


export class DashboardView extends React.Component {

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.props.fetchConfiguration(this.props.params.id);
    }

    componentDidUpdate(prevProps) {
        if(this.props.configuration){
            const { title } = this.props.configuration.toJS();
            this.props.setPageTitle(title);
        }

        console.log(JSON.stringify(this.props, null, 2));

        // TODO fetch new configuration if dashboard id changed
        // TODO do not fetch if fetch is currently in progress
        // TODO do not fetch if matching config is already loaded
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
                                <Visualization id={visualization.id} />
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
    fetchConfiguration: function(id) {
        dispatch(ConfigurationsActions.fetch(
            id,
            ConfigurationsActionKeyStore.DASHBOARDS
        ));
    },
 });


export default connect(mapStateToProps, actionCreators)(DashboardView);
