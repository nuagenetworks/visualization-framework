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

import parse from "json-templates";

import { GraphManager } from "../Graphs/index";

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
        // Note: It looks unnecessary as the configuration won't be fetched here.
        // this.updateQuery(this.props);
        // this.updateQueryResults(this.props);
    }

    // Note: This method is called everytime a props has changed
    componentWillReceiveProps(nextProps) {
        console.error(JSON.stringify(this.props));
        console.error(JSON.stringify(nextProps));

        // Note: When changing the props.id, we need to update the configuration
        if (this.props.id !== nextProps.id) {
            this.props.fetchConfigurationIfNeeded(nextProps.id);
        }

        // Note: When the props.configuration has been updated, we need to update the query
        if (this.props.configuration !== nextProps.configuration) {
            console.error("Configuration changed !");
            this.updateQuery(nextProps);
        }

        // Note: when the props.query has been updated, we need to update the query results
        if (this.props.queryTemplate !== nextProps.queryTemplate) {
            console.error("queryTemplate changed !");
            this.updateQueryResults(nextProps);
        }
    }

    // Note: This is always called after the render has been done.
    // The content of this method is called twice:
    // 1. In componentWillMount
    // 2. In componentDidUpdate
    // componentDidUpdate(prevProps) {
    //     this.props.fetchConfigurationIfNeeded(this.props.id);
    //     this.updateQuery();
    //     this.updateQueryResults();
    // }

    updateQuery(props) {
        const { configuration, fetchQueryIfNeeded } = props;

        if (configuration) {
            fetchQueryIfNeeded(configuration.get("query"));
        }
    }

    updateQueryResults(props) {
        const { queryTemplate, executeQueryIfNeeded } = props;

        // TODO get the context from the route.
        const context = {
            parent: "enterprises",
            parentID: "abc"
        };

        if (queryTemplate) {
            const template = parse(queryTemplate),
                  query    = template(context);

            console.error("MAKING QUERY");
            console.error(query);

            executeQueryIfNeeded(query);
        }
    }

    render() {
        const { configuration } = this.props;
        let title, body;

        if (configuration) {
            title = configuration.get("title");

            const graphName      = configuration.get("graph") || "ImageGraph",
                  GraphComponent = GraphManager.getGraphComponent(graphName);

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
    if (props.configuration) {
        const queryConfiguration = state.configurations.getIn([
            ConfigurationsActionKeyStore.QUERIES,
            props.configuration.get("query")
        ]);

        if (queryConfiguration && !queryConfiguration.get(
            ConfigurationsActionKeyStore.IS_FETCHING
        )) {
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
    },

    executeQueryIfNeeded: function(query) {

        // TODO execute this query - now it is a valid ES query
        console.log(JSON.stringify(query, null, 2));

        // The following line does execute the query,
        // but keeps doing so over and over again.
        //dispatch(ServiceActions.fetch(query, "elasticsearch"));

        // TODO create fetchIfNeeded
        //dispatch(ServiceActions.fetchIfNeeded(query, "elasticsearch"));
    }

 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
