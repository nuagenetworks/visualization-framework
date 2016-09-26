import React from "react";
import { connect } from "react-redux";

import { Actions as ConfigurationsActions, ActionKeyStore as ConfigurationsActionKeyStore } from "../../services/configurations/redux/actions"
import { Actions as ElasticSearchActions, ActionKeyStore as ElasticSearchActionKeyStore, getRequestID } from "../../services/elasticsearch/redux/actions"

import CircularProgress from "material-ui/CircularProgress";
import graph1 from "../../images/graph1.png"
import graph2 from "../../images/graph2.png"
import graph3 from "../../images/graph3.png"
import graph4 from "../../images/graph4.png"

import {theme} from "../../theme"
import store from "../../redux/store"

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

    constructor(props){
        super(props);
        this.state = {
            queryID: null,
            queryConfiguration: null,
            parameterizedQuery: null,
            componentShouldDisplay: false,
            request: null,
        }
    }

    componentWillMount() {
        this.loadConfiguration(this.props.id);
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.id !== nextProps.id)
            this.loadConfiguration(nextProps.id)

        if (nextProps.configuration.query && nextProps.configuration.query !== this.state.queryID)
            this.loadQuery(nextProps.configuration.query);
    }

    loadConfiguration(id) {
        // 1. Load its configuration according to the identifier given in its props
        this.props.fetchConfiguration(id);
    }

    loadQuery (id) {
        // 2. Load its query configuration according to its configuration
        const state                  = store.getState(),
              queryConfiguration     = state.configurations.getIn([
                                            ConfigurationsActionKeyStore.QUERIES,
                                            id,
                                            ConfigurationsActionKeyStore.DATA
                                       ]),
              requestID              = getRequestID(id, this.props.context);

        // 3. Parameterize its query according to the context given in its props
        // 4. Choose to be hidden or displayed based on the context and the query
        // TODO: Use query templating method (See https://github.com/nuagenetworks/visualization-framework/issues/47)
        // For now, we assume the configuration has default parameters.
        let parameterizedQuery     = queryConfiguration,
            componentShouldDisplay = true;

        this.setState({
            queryID: id,
            queryConfiguration: queryConfiguration,
            parameterizedQuery: parameterizedQuery,
            componentShouldDisplay: componentShouldDisplay,
        });

        if (componentShouldDisplay) {
            let component = this;

            store.dispatch(ElasticSearchActions.fetch(id, parameterizedQuery, requestID)).then(function () {
                let request = store.getState().elasticsearch.getIn([ElasticSearchActionKeyStore.REQUESTS, requestID]).toJS();

                component.setState({
                    request: request,
                });
            });
        }

    }

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

    shouldShowCircularProgress () {
        return !this.props.configuration || !this.state.queryConfiguration || !this.state.request || this.state.request.isFetching;
    }

    render() {
        if (this.shouldShowCircularProgress()) {
            return (
                <div>
                    <CircularProgress color="#eeeeee"/>
                    This visualization component is loading, pleaes wait...
                </div>
            );
        }

        let configuration = this.props.configuration;

        return (
            <div style={style.card}>
                {this.state.queryConfiguration.id}
                <h1>{configuration.title}</h1>
                <div>
                    <img src={this.getGraph(this.props.id)} alt={this.props.id} width="100%" height="100%" />
                </div>
            </div>
        );
    }
}

VisualizationView.propTypes = {
  id: React.PropTypes.string,
  context: React.PropTypes.object,
};


const mapStateToProps = (state, ownProps) => ({
    configuration: state.configurations.getIn([
        ConfigurationsActionKeyStore.VISUALIZATIONS,
        ownProps.id,
        ConfigurationsActionKeyStore.DATA
    ]),
});


const actionCreators = (dispatch) => ({
    fetchConfiguration: function(id) {
        dispatch(ConfigurationsActions.fetch(
            id,
            ConfigurationsActionKeyStore.VISUALIZATIONS
        ))
    },

 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
