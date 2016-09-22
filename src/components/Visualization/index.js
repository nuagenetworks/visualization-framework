import React from "react";
import { connect } from "react-redux";

import { Actions as ConfigurationsActions, ActionKeyStore as ConfigurationsActionKeyStore } from "../../services/configurations/redux/actions"

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

    componentWillMount() {
        this.loadConfiguration(this.props.id);
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.id !== nextProps.id)
            this.loadConfiguration(nextProps.id)

        if (nextProps.configuration.query)
            this.makeQuery(nextProps.configuration.query);
    }

    loadConfiguration(id) {
        // 1. Load its configuration according to the identifier given in its props
        this.props.fetchConfiguration(id);
    }

    makeQuery(id) {
        const state = store.getState();
        const queryConfiguration = state.configurations.getIn([
            ConfigurationsActionKeyStore.QUERIES,
            id,
            ConfigurationsActionKeyStore.DATA
        ])

        // 2. Load its query configuration according to its configuration
        console.error("CONFIG=");
        console.error(queryConfiguration);

        // 3. Parameterize its query according to the context given in its props
        // 4. Choose to be hidden or displayed based on the context and the query
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

    render() {

        if (!this.props.configuration) {
            return (
                <div>
                    <CircularProgress color="#eeeeee"/>
                    This visualization component is loading its configuration file...
                </div>
            );
        }

        let configuration = this.props.configuration;

        return (
            <div style={style.card}>
                {this.props.query}
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
    // query: state.configurations.getIn([
    //     ConfigurationsActionKeyStore.QUERIES,
    //     configuration.query,
    //     ConfigurationsActionKeyStore.DATA
    // ])
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
