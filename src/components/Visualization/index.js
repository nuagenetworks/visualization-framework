import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import AppBar from "material-ui/AppBar";
import CircularProgress from "material-ui/CircularProgress";
import { theme } from "../../theme";

import { Actions } from "./redux/actions";
import { Actions as ServiceActions } from "../../services/servicemanager/redux/actions";
import {
  Actions as ConfigurationsActions,
  ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions";

import { parameterizedConfiguration } from "../../utils/configurations";
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
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.id !== nextProps.id) {
            this.props.fetchConfigurationIfNeeded(nextProps.id);
        }

        if ((!this.props.configuration && nextProps.configuration) ||
            (this.props.configuration && nextProps.configuration && this.props.configuration.id !== nextProps.configuration.id))
        {
            this.updateQuery(nextProps);
        }

        if ((!this.props.queryConfiguration && nextProps.queryConfiguration) ||
            (this.props.queryConfiguration && nextProps.queryConfiguration && this.props.queryConfiguration.id !== nextProps.queryConfiguration.id))
        {
            this.updateQueryResults(nextProps);
        }
    }

    updateQuery(props) {
        const { configuration, fetchQueryIfNeeded } = props;

        if (configuration) {
            fetchQueryIfNeeded(configuration.get("query"));
        }
    }

    updateQueryResults(props) {
        const { queryConfiguration, executeQueryIfNeeded } = props;

        // TODO get the context from the route.
        const context = {
            parentResource: "enterprises",
            parentID: "abc"
        };

        if (queryConfiguration) {
            const pQuery = parameterizedConfiguration(queryConfiguration, context);
            executeQueryIfNeeded(pQuery);
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
            props.queryConfiguration = queryConfiguration.get(
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

    executeQueryIfNeeded: function(pQuery) {
        console.log("executeQueryIfNeeded");
        console.log(JSON.stringify(pQuery, null, 2));

        dispatch(ServiceActions.fetchIfNeeded(pQuery.query, pQuery.service));
    }

 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
