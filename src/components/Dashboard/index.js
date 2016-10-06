import React from "react";
import ReactDOM from "react-dom";
import { connect } from "react-redux";

import CircularProgress from "material-ui/CircularProgress";
import ReactGridLayout from "react-grid-layout";

import Visualization from "../Visualization";

import { Actions as AppActions } from "../App/redux/actions";

import {
    Actions as ConfigurationsActions,
    ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions"

import { resizeVisualization } from "../../utils/resize"


export class DashboardView extends React.Component {

    constructor(props) {
        super(props);
        this._gridItems = {};
    }

    componentWillMount() {
        this.props.setPageTitle("Dashboard");
        this.updateConfiguration();
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

    storeGridItem = (c) => {
        this._gridItems[c.props.id] = ReactDOM.findDOMNode(c).parentElement;
    }

    setInnerVisualizationlayout = (id) => {
        resizeVisualization(this._gridItems[id]);
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
                <ReactGridLayout
                    cols={12}
                    rowHeight={10}
                    width={1200}
                    onResize={(layout, previousItemLayout, currentItemLayout) => this.setInnerVisualizationlayout(currentItemLayout.i)}
                    >
                    {
                        visualizations.map((visualization, index) =>
                            <div key={visualization.id} data-grid={visualization}>
                                <Visualization id={visualization.id} context={location.query} ref={this.storeGridItem}/>
                            </div>
                        )
                    }
                </ReactGridLayout>
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
