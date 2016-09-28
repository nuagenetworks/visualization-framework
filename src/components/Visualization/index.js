import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import AppBar from "material-ui/AppBar";
import CircularProgress from "material-ui/CircularProgress";
import { theme } from "../../theme";

import { Actions } from "./redux/actions";
import {
  Actions as ConfigurationsActions,
  ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions"

//import { ServiceManager } from "../../services/servicemanager";
//console.log(ServiceManager);

import ImageGraph from "../Graphs/ImageGraph";
import parse from "json-templates";

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
        this.updateQueryResults();
    }

    componentDidUpdate(prevProps) {
        this.props.fetchConfigurationIfNeeded(this.props.id);
        this.updateQuery();
        this.updateQueryResults();
    }

    updateQuery() {
        const { configuration, fetchQueryIfNeeded } = this.props;

        if (configuration) {
            fetchQueryIfNeeded(configuration.get("query"));
        }
    }

    updateQueryResults() {
        const { queryTemplate } = this.props;

        // TODO get the context from the route.
        const context = {};

        if (queryTemplate) {
            const template = parse(queryTemplate);
            const query = template(context);

            // TODO execute this query - now it is a valid ES query
            console.log(JSON.stringify(query, null, 2));
        }
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

const mapStateToProps = (state, ownProps) => {

    const props = {

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

    };

    // Expose the query template as a JS object if it is available.
    if(props.configuration){
        const queryConfiguration = state.configurations.getIn([
            ConfigurationsActionKeyStore.QUERIES,
            props.configuration.get("query")
        ]);
        if(queryConfiguration && !queryConfiguration.get(
            ConfigurationsActionKeyStore.IS_FETCHING
        )){
            props.queryTemplate = queryConfiguration.get(
                ConfigurationsActionKeyStore.DATA
            ).toJS();
        }
    }

    return props;
};


const actionCreators = (dispatch) => ({
    setPageTitle: function(aTitle) {
        dispatch(Actions.updateTitle(aTitle));
    },
    goTo: function(link, filters) {
        dispatch(push({pathname:link, query:filters}));
    },
    fetchConfigurationIfNeeded: function(id) {
        dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.VISUALIZATIONS
        ));
    },
    fetchQueryIfNeeded: function(id) {
        dispatch(ConfigurationsActions.fetchIfNeeded(
            id,
            ConfigurationsActionKeyStore.QUERIES
        ));
    }
 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
