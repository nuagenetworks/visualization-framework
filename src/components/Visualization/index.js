import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import AppBar from "material-ui/AppBar";
import CircularProgress from "material-ui/CircularProgress";

import { Actions } from "./redux/actions";
import {
  Actions as ConfigurationsActions,
  ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions"

import { theme } from "../../theme";

import ImageGraph from "../Graphs/ImageGraph";

// TODO split this out into something like "GraphManager",
// and add a register() function
const graphComponents = {
  "ImageGraph": ImageGraph
};

function getGraphComponent(type){
  return graphComponents[type];
}

const style = {
    navBar: {
        background: theme.palette.primary2Color,
    },
    card: {
        border: theme.palette.thinBorder + theme.palette.primary2Color,
        borderRadius: theme.palette.smallBorderRadius,
    }
};

class VisualizationView extends React.Component {

    componentWillMount() {
        this.props.fetchConfigurationIfNeeded(this.props.id);
        this.updateQuery();
    }

    componentDidUpdate(prevProps) {
        this.props.fetchConfigurationIfNeeded(this.props.id);
        this.updateQuery();
    }

    updateQuery() {
        const { configuration, fetchQueryIfNeeded } = this.props;

        if (configuration) {
            fetchQueryIfNeeded(configuration.get("query"))
                .then(this.updateQueryResults);
        }
    }

    updateQueryResults(queryConfiguration) {
          // TODO use this configuration to execute the query.
          console.log(queryConfiguration);
    }

    render() {
        const { configuration } = this.props;
        let title, body;

        if(configuration){
            title = configuration.get("title");

            const graph = configuration.get("graph") || "ImageGraph";
            const GraphComponent = getGraphComponent(graph);
            body = (
                <GraphComponent {...this.props} />
            );
        } else {
            title = "Loading...";
            body = (
                <CircularProgress color="#eeeeee"/>
            );
        }

        return (
            <div style={style.card}>
                <AppBar
                    title={title}
                    showMenuIconButton={false}
                    style={style.navBar}
                    />
                { body }
            </div>
        );
    }
}

const mapStateToProps = (state, ownProps) => ({

    configuration: state.configurations.getIn([
        ConfigurationsActionKeyStore.VISUALIZATIONS,
        ownProps.id,
        ConfigurationsActionKeyStore.DATA
    ]),

    error: state.configurations.getIn([
        ConfigurationsActionKeyStore.VISUALIZATIONS,
        ownProps.id,
        ConfigurationsActionKeyStore.ERROR
    ])

});


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    },
    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    },
    fetchConfigurationIfNeeded: function(id) {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.VISUALIZATIONS
        ));
    },
    fetchQueryIfNeeded: function(id) {
        return dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.QUERIES
        ));
    }
 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
