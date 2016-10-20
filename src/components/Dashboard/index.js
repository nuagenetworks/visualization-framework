import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";

import CircularProgress from "material-ui/CircularProgress";
import { Responsive, WidthProvider } from 'react-grid-layout';
const ResponsiveReactGridLayout = WidthProvider(Responsive);

import Visualization from "../Visualization";

import { Actions as AppActions } from "../App/redux/actions";

import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions"

export class DashboardView extends React.Component {

    constructor(props) {
        super(props);
        this.resizeCallbacks = [];
    }

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.updateConfiguration();
    }

    componentWillUnmount() {
        this.resizeCallbacks = null;
    }

    componentDidUpdate(prevProps) {
        this.updateTitleIfNecessary(prevProps);
        this.updateConfiguration();
    }

    shouldUpdateTitle(prevProps){
        if (!prevProps.configuration) {
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
        const { configuration, setPageTitle } = this.props;

        if (!configuration)
            return;

        if (this.shouldUpdateTitle(prevProps)) {
            setPageTitle(configuration.get("title"));
        }
    }

    updateConfiguration() {
        const { params, fetchConfigurationIfNeeded } = this.props;

        if (!params.id)
            return;

        fetchConfigurationIfNeeded(params.id);
    }

    onResize(layout) {
        this.resizeCallbacks.forEach((callback) => callback())
    }

    registerResize(callback){
        this.resizeCallbacks.push(callback);
    }

    render() {
        const { configuration, error, fetching, location} = this.props

        if (fetching) {
            return (
                <div>
                    <CircularProgress color="#eeeeee"/>
                    This dashboard component is loading the configuration file...
                </div>
            );

        } else if (error) {
            return (
                <div>{error}</div>
            );

        } else if (configuration) {
            const { visualizations } = configuration.toJS();

            return (
                <ResponsiveReactGridLayout
                    rowHeight={10}
                    margin={[12,12]}
                    containerPadding={[10,10]}
                    onResize={this.onResize.bind(this)}
                    onLayoutChange={this.onResize.bind(this)}
                >
                    {
                        visualizations.map((visualization, index) =>
                            <div
                                key={visualization.id}
                                data-grid={visualization}
                            >
                                <Visualization
                                    id={visualization.id}
                                    context={location.query}
                                    registerResize={this.registerResize.bind(this)}
                                />
                            </div>
                        )
                    }
                </ResponsiveReactGridLayout>
            );
        } else {
            return <div>No dashboard</div>
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
    setPageTitle: (aTitle) => {
        dispatch(AppActions.updateTitle(aTitle));
    },
    fetchConfigurationIfNeeded: (id) => {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.DASHBOARDS
        ));
    }
});


export default connect(mapStateToProps, actionCreators)(DashboardView);
