import React from "react";
import { connect } from "react-redux";
import { push } from "redux-router";

import AppBar from "material-ui/AppBar";

import { Actions } from "./redux/actions";

import {
  Actions as ConfigurationsActions,
  ActionKeyStore as ConfigurationsActionKeyStore
} from "../../services/configurations/redux/actions"

import graph1 from "../../images/graph1.png"
import graph2 from "../../images/graph2.png"
import graph3 from "../../images/graph3.png"
import graph4 from "../../images/graph4.png"

import {theme} from "../../theme"

const style = {
    navBar: {
        background: theme.palette.primary2Color,
    },
    card: {
        border: theme.palette.thinBorder + theme.palette.primary2Color,
        borderRadius: theme.palette.smallBorderRadius,
    }
};

function getGraph(name) {
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


class VisualizationView extends React.Component {

    componentWillMount() {
        const { configuration, isFetching, id, fetchConfiguration } = this.props;
        if(!(configuration || isFetching)){
            fetchConfiguration(id);
        }
    }

    render() {
        const { id, configuration } = this.props;
        const title = configuration ? configuration.get("title") : "Loading...";
        return (
            <div style={style.card}>
                <AppBar
                    title={title}
                    showMenuIconButton={false}
                    style={style.navBar}
                    />
                <div>
                    <img src={getGraph(id)} alt={id} width="100%" height="100%" />
                </div>
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

    fetching: state.configurations.getIn([
        ConfigurationsActionKeyStore.VISUALIZATIONS,
        ownProps.id,
        ConfigurationsActionKeyStore.IS_FETCHING
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
    fetchConfiguration: function(id) {
        dispatch(ConfigurationsActions.fetch(
            id,
            ConfigurationsActionKeyStore.VISUALIZATIONS
        ));
    }
 });


export default connect(mapStateToProps, actionCreators)(VisualizationView);
